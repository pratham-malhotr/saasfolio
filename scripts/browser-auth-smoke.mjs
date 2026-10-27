import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

// UI-only browser scenarios. Every /api/ request is intercepted by Chrome,
// including all auth writes. No real user, cookie session or email is created.
// Backend routes and provider callbacks have separate isolated regression tests.
const origin = (process.argv[2] || "http://127.0.0.1:3210").replace(/\/$/, "");
const profile = await mkdtemp(join(tmpdir(), "saasfolio-auth-ui-"));
const chrome = spawn(process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
  "--headless=new", "--remote-debugging-pipe", `--user-data-dir=${profile}`,
  "--no-first-run", "--no-default-browser-check", "about:blank",
], { stdio: ["ignore", "ignore", "ignore", "pipe", "pipe"] });
let sequence = 0, buffer = "";
const pending = new Map();
const runtimeErrors = [], interceptionErrors = [], authRequests = [], unexpectedWrites = [];
let interceptionSession;
let scenario = { available: false, providers: { google: false, apple: false }, mode: "unavailable", login: "error", oauthError: false, recoveryAllowed: false, user: null, logout: "error" };
chrome.stdio[4].on("data", chunk => {
  buffer += chunk.toString();
  let boundary;
  while ((boundary = buffer.indexOf("\0")) >= 0) {
    const message = JSON.parse(buffer.slice(0, boundary)); buffer = buffer.slice(boundary + 1);
    if (message.method === "Runtime.exceptionThrown") runtimeErrors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
    if (message.method === "Fetch.requestPaused") void intercept(message.params).catch(error => interceptionErrors.push(error.message));
    if (!message.id || !pending.has(message.id)) continue;
    const { resolve, reject, timer } = pending.get(message.id); pending.delete(message.id); clearTimeout(timer);
    if (message.error) reject(new Error(message.error.message)); else resolve(message.result);
  }
});
function send(method, params = {}, sessionId) {
  const id = ++sequence;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Chrome timed out: ${method}`)); }, 15000);
    pending.set(id, { resolve, reject, timer });
    chrome.stdio[3].write(`${JSON.stringify({ id, method, params, sessionId })}\0`);
  });
}
async function intercept({ requestId, request }) {
  const url = new URL(request.url);
  async function reply(body, responseCode = 200, contentType = "application/json") {
    await send("Fetch.fulfillRequest", { requestId, responseCode, responseHeaders: [{ name: "Content-Type", value: contentType }, { name: "Cache-Control", value: "no-store" }], body: Buffer.from(typeof body === "string" ? body : JSON.stringify(body)).toString("base64") }, interceptionSession);
  }
  if (url.origin === origin && url.pathname.startsWith("/api/")) {
    if (url.pathname === "/api/health") return reply({ checks: { accountsConfigured: scenario.available, formsConfigured: false, newsletterConfigured: false }, authProviders: scenario.providers, authMode: scenario.mode, minimumPasswordLength: 12 });
    if (url.pathname === "/api/auth/session") return reply({ configured: scenario.available, user: scenario.user, recoveryAllowed: scenario.recoveryAllowed });
    if (url.pathname === "/api/account") return reply({ error: "Sign in to continue." }, 401);
    if (request.method === "POST" && /^\/api\/auth\/(?:login|signup|reset|password|oauth|logout)$/.test(url.pathname)) {
      const body = JSON.parse(request.postData || "{}");
      authRequests.push({ path: url.pathname, body });
      // Hold the response briefly to expose pending/duplicate-request behavior.
      await new Promise(resolve => setTimeout(resolve, 200));
      if (url.pathname === "/api/auth/signup") return reply({ user: null, message: "Check your inbox to confirm your email before signing in." });
      if (url.pathname === "/api/auth/reset") return reply({ message: "If an account exists, a password reset email has been requested." });
      if (url.pathname === "/api/auth/password") return reply({ ok: true, requiresReauthentication: true });
      if (url.pathname === "/api/auth/oauth") return scenario.oauthError ? reply({ error: "Provider sign-in is temporarily unavailable." }, 503) : reply({ url: `https://oauth.example/authorize?provider=${body.provider}` });
      if (url.pathname === "/api/auth/logout") {
        if (scenario.logout === "error") return reply({ error: "Sign-out could not be confirmed. Please try again." }, 503);
        scenario.user = null;
        return reply({ ok: true });
      }
      return scenario.login === "error" ? reply({ error: "Sign in failed. Check your email and password." }, 401) : reply({ user: { id: "mock-ui-only", email: "ui-smoke@example.test" } });
    }
    if (!["GET", "HEAD", "OPTIONS"].includes(request.method)) unexpectedWrites.push({ path: url.pathname, method: request.method });
    return reply({ error: "This endpoint is outside the UI fixture." }, 503);
  }
  if (url.hostname === "oauth.example") return reply("<!doctype html><html><title>Mock provider</title><h1>Mock OAuth authorization</h1><p>No provider request or account was created.</p></html>", 200, "text/html");
  if (url.origin !== origin) return send("Fetch.failRequest", { requestId, errorReason: "BlockedByClient" }, interceptionSession);
  return send("Fetch.continueRequest", { requestId }, interceptionSession);
}
async function until(check, description) {
  for (let attempt = 0; attempt < 200; attempt++) { const value = await check(); if (value) return value; await new Promise(resolve => setTimeout(resolve, 100)); }
  throw new Error(`Browser condition failed: ${description}`);
}
try {
  await send("Browser.getVersion");
  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  interceptionSession = sessionId;
  const page = (method, params) => send(method, params, sessionId);
  const evaluate = async expression => {
    const result = await page("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    return result.result.value;
  };
  await page("Page.enable"); await page("Runtime.enable");
  await page("Fetch.enable", { patterns: [{ urlPattern: `${origin}/api/*` }, { urlPattern: "https://*" }] });
  await page("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  let viewportWidth = 390;
  async function navigate(path) {
    await page("Page.navigate", { url: `${origin}${path}` });
    await until(() => evaluate(`location.href === ${JSON.stringify(`${origin}${path}`)} && document.readyState === 'complete'`), path);
  }
  async function ready() {
    try {
      await until(() => evaluate("!!document.querySelector('#auth-provider-status') && !document.querySelector('#auth-provider-status').textContent.includes('Checking')"), "Auth readiness has loaded");
    } catch (error) {
      const state = await evaluate("({href:location.href,title:document.title,body:document.body.textContent.slice(0,1500),ready:document.readyState})");
      throw new Error(`${error.message}; state=${JSON.stringify(state)}; runtimeErrors=${JSON.stringify(runtimeErrors)}; interceptionErrors=${JSON.stringify(interceptionErrors)}`, { cause:error });
    }
  }
  async function enter(selector, value) {
    await until(() => evaluate(`(() => { const input = document.querySelector(${JSON.stringify(selector)}); return !!input && !input.disabled && Object.keys(input).some(key => key.startsWith('__reactProps')); })()`), `Hydrated input ${selector}`);
    await evaluate(`(() => { const input = document.querySelector(${JSON.stringify(selector)}); input.focus(); input.select(); })()`);
    await page("Input.insertText", { text: value });
  }
  async function clickTarget(expression, description) {
    await until(() => evaluate(`(() => { const button = ${expression}; return !!button && !button.disabled && Object.keys(button).some(key => key.startsWith('__reactProps')); })()`), `Enabled ${description}`);
    await evaluate(`(${expression}).scrollIntoView({ block: 'center', behavior: 'instant' })`);
    let previous, stable = 0;
    await until(async () => { const rect = await evaluate(`(() => { const r = (${expression}).getBoundingClientRect(); return [r.x,r.y,r.width,r.height]; })()`); stable = JSON.stringify(rect) === JSON.stringify(previous) ? stable + 1 : 0; previous = rect; return stable >= 2; }, `Stable ${description}`);
    const point = await evaluate(`(() => { const r = (${expression}).getBoundingClientRect(); return { x:r.x+r.width/2, y:r.y+r.height/2 }; })()`);
    await until(() => evaluate(`(${expression}).contains(document.elementFromPoint(${point.x},${point.y}))`), `${description} receives input`);
    await page("Input.dispatchMouseEvent", { type: "mousePressed", button: "left", clickCount: 1, ...point });
    await page("Input.dispatchMouseEvent", { type: "mouseReleased", button: "left", clickCount: 1, ...point });
  }
  const click = selector => clickTarget(`document.querySelector(${JSON.stringify(selector)})`, selector);
  const clickText = text => clickTarget(`[...document.querySelectorAll('button')].find(button => button.textContent.trim() === ${JSON.stringify(text)} && button.offsetParent !== null)`, text);
  async function providers(expected) {
    await ready();
    const buttons = await evaluate("[...document.querySelectorAll('[data-auth-provider]')].map(button=>({provider:button.dataset.authProvider,disabled:button.disabled,type:button.type}))");
    assert.equal(buttons.length, 2, "Google and Apple options remain visible");
    for (const button of buttons) { assert.equal(button.disabled, !expected[button.provider]); assert.equal(button.type, "button", "OAuth is independent of credential form validation"); }
    assert.ok(await evaluate("document.documentElement.scrollWidth") <= viewportWidth, `Auth page fits actual ${viewportWidth}px device`);
  }
  async function screenshot(name, centerProviders = true) {
    if (centerProviders) await evaluate("document.querySelector('section[aria-label=\"Provider sign-in options\"]').scrollIntoView({ block:'center', behavior:'instant' })");
    await evaluate("document.fonts.ready.then(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))");
    const result = await page("Page.captureScreenshot", { format: "png" });
    const path = join(tmpdir(), name); await writeFile(path, Buffer.from(result.data, "base64")); console.log(`Screenshot: ${path}`);
  }
  async function submitTwice(path) {
    const before = authRequests.filter(request => request.path === path).length;
    await evaluate("document.querySelector('[data-auth-email-form]').requestSubmit(); document.querySelector('[data-auth-email-form]').requestSubmit()");
    await until(() => authRequests.filter(request => request.path === path).length > before, `Mock ${path} request`);
    assert.equal(authRequests.filter(request => request.path === path).length, before + 1, "Synchronous duplicate form submissions create one request");
  }
  for (const viewport of [{ width: 390, height: 844, mobile: true }, { width: 1440, height: 1000, mobile: false }]) {
    viewportWidth = viewport.width;
    const label = viewport.mobile ? "mobile" : "desktop";
    await page("Emulation.setDeviceMetricsOverride", { ...viewport, deviceScaleFactor: 1 });
    scenario = { available: false, providers: { google: false, apple: false }, mode: "unavailable", login: "error", oauthError: false, recoveryAllowed: false, user: null, logout: "error" };
    await navigate("/login?redirect=https%3A%2F%2Fevil.example%2Fsubmit"); await providers(scenario.providers);
    assert.ok(await evaluate("document.querySelector('[data-auth-email-form] fieldset').disabled"));
    assert.equal(await evaluate("document.querySelector('[data-auth-back]').getAttribute('href')"), "/", "Unsafe return links become local navigation");
    assert.ok(await evaluate("!document.querySelector('main').textContent.includes('Sign In Required To Submit Codes')"), "An unsafe URL cannot spoof submit context");
    await screenshot(`saasfolio-auth-unavailable-${label}.png`);

    scenario.available = true; scenario.mode = "local";
    await navigate("/signup?redirect=%2Fdiscounts%2Fbeehiiv"); await providers(scenario.providers);
    assert.ok(await evaluate("!document.querySelector('[data-auth-email-form] fieldset').disabled"), "Email signup works independently when providers are unavailable");
    assert.equal(await evaluate("document.querySelector('#auth-password').minLength"), 12);
    await enter("#auth-name", "UI Smoke Fixture"); await enter("#auth-email", "ui-smoke@example.test"); await enter("#auth-password", "short123");
    assert.equal(await evaluate("document.querySelector('[data-auth-email-form]').checkValidity()"), false, "Short new passwords fail the announced policy");
    const rawPassword = "  email-password-with-spaces  ";
    await enter("#auth-password", rawPassword); await screenshot(`saasfolio-auth-email-signup-${label}.png`);
    await submitTwice("/api/auth/signup");
    await until(() => evaluate("document.querySelector('main').textContent.includes('Check your inbox to confirm')"), "Email confirmation notice");
    assert.equal(authRequests.at(-1).body.password, rawPassword, "Email password whitespace is preserved");
    assert.equal(authRequests.at(-1).body.redirect, "/discounts/beehiiv");

    await navigate("/login?redirect=%2Fdiscounts%2Fbeehiiv%3Fauth-ui%3Demail"); await providers(scenario.providers);
    assert.equal(await evaluate("document.querySelector('#auth-password').minLength"), 1, "Existing login passwords do not inherit the new-password minimum");
    await enter("#auth-email", "ui-smoke@example.test"); await enter("#auth-password", " x ");
    await submitTwice("/api/auth/login");
    await until(() => evaluate("document.querySelector('[role=alert]')?.textContent.includes('Sign in failed')"), "Credential error is shown");
    assert.equal(await evaluate("document.querySelector('#auth-password').value"), " x ");
    scenario.login = "success";
    await submitTwice("/api/auth/login");
    await until(() => evaluate("location.pathname === '/discounts/beehiiv' && location.search === '?auth-ui=email'"), "Successful email login uses the safe return path");

    await navigate("/login"); await providers(scenario.providers);
    await clickText("Forgot password?");
    await until(() => evaluate("document.querySelector('main h1')?.textContent === 'Reset your password'"), "Reset-email form is available");
    assert.ok(await evaluate("!document.querySelector('#auth-password') && !document.querySelector('[data-auth-provider]')"), "Reset email requires neither password nor provider login");
    await enter("#auth-email", "ui-smoke@example.test"); await submitTwice("/api/auth/reset");
    await until(() => evaluate("document.querySelector('main').textContent.includes('If an account exists, a password reset email has been requested.')"), "Reset request uses privacy-preserving confirmation copy");
    assert.equal(authRequests.at(-1).body.email, "ui-smoke@example.test");

    scenario.providers = { google: true, apple: true }; scenario.mode = "supabase";
    for (const [path, provider] of [["/login", "google"], ["/signup", "apple"]]) {
      await navigate(`${path}?redirect=%2Fdiscounts%2Fpredis-ai%23questions`); await providers(scenario.providers);
      assert.equal(await evaluate("document.querySelector('[data-auth-email-form]').checkValidity()"), false, "Provider navigation does not require email credentials");
      if (path === "/login") await screenshot(`saasfolio-auth-providers-ready-${label}.png`);
      const count = authRequests.length; await click(`[data-auth-provider=${provider}]`);
      await until(() => evaluate(`location.hostname === 'oauth.example' && location.search === '?provider=${provider}'`), `${provider} opens the mocked authorization destination`);
      assert.deepEqual(authRequests[count].body, { provider, redirect: "/discounts/predis-ai#questions" });
    }

    scenario.oauthError = true;
    await navigate("/login?redirect=%2F%252F%252Fevil.example"); await providers(scenario.providers);
    await enter("#auth-email", "ui-smoke@example.test"); await enter("#auth-password", rawPassword);
    await click('[data-auth-provider="google"]');
    await until(() => evaluate("document.querySelector('[role=alert]')?.textContent.includes('temporarily unavailable')"), "OAuth failure has a usable message");
    assert.equal(authRequests.at(-1).body.redirect, "/profile", "Encoded external return paths cannot escape the site");
    assert.equal(await evaluate("document.querySelector('#auth-password').value"), rawPassword, "OAuth failure does not discard independent email credentials");
    assert.ok(await evaluate("!document.querySelector('[data-auth-email-submit]').disabled"), "Email remains usable after a provider failure");

    const requestsBeforeCallbackErrors = authRequests.length;
    for (const [error, message] of [["oauth", "Provider sign-in could not be completed"], ["confirmation", "That confirmation link could not be used"]]) {
      await navigate(`/login?error=${error}&error_description=private-provider-detail`); await providers(scenario.providers);
      const alert = await evaluate("document.querySelector('main [role=alert]')?.textContent");
      assert.ok(alert?.includes(message), `${error}: canceled or unusable callbacks show a useful generic error`);
      assert.ok(!alert.includes("private-provider-detail"), "Raw provider descriptions never appear in auth errors");
    }
    assert.equal(authRequests.length, requestsBeforeCallbackErrors, "Callback error displays do not submit credentials");

    scenario.oauthError = false; scenario.recoveryAllowed = false;
    await navigate("/reset-password?recovery=1");
    await until(() => evaluate("!!document.querySelector('#auth-current-password') && !document.querySelector('[data-auth-email-form] fieldset').disabled"), "A query alone does not bypass current-password confirmation");
    assert.ok(await evaluate("document.querySelector('#auth-current-password').required"));
    await enter("#auth-current-password", " old password "); await enter("#auth-password", rawPassword);
    await submitTwice("/api/auth/password");
    await until(() => evaluate("location.pathname === '/login' && location.search === '?reset=success'"), "Password change requires signing in again");
    assert.equal(authRequests.at(-1).body.currentPassword, " old password ");
    scenario.recoveryAllowed = true;
    await navigate("/reset-password");
    await until(() => evaluate("document.querySelector('main').textContent.includes('Password reset access confirmed')"), "Server-confirmed recovery access is recognized");
    assert.ok(await evaluate("!document.querySelector('#auth-current-password')"));
    await enter("#auth-password", rawPassword); await submitTwice("/api/auth/password");
    await until(() => evaluate("location.pathname === '/login' && location.search === '?reset=success'"), "Recovery password update returns to sign-in");
    assert.deepEqual(await evaluate("Object.keys(localStorage).filter(key => /auth|session|token/i.test(key))"), [], "Auth UI never stores sessions in localStorage");

    scenario.user = { id: "mock-ui-only", name: "UI Smoke Fixture", email: "ui-smoke@example.test", avatarLetter: "U", isAdmin: false };
    scenario.logout = "error";
    await navigate("/discounts/beehiiv?auth-ui=signout");
    await until(() => evaluate("!!document.querySelector('button[aria-label=\"Open account menu\"]')"), "Navbar recognizes the mocked signed-in user");
    await click(viewport.mobile ? 'button[aria-label="Toggle menu"]' : 'button[aria-label="Open account menu"]');
    const signOutExpression = "[...document.querySelectorAll('button')].find(button => button.textContent.includes('Sign Out') && button.offsetParent !== null)";
    const logoutBeforeFailure = authRequests.filter(request => request.path === "/api/auth/logout").length;
    await evaluate(`(() => { const button = ${signOutExpression}; button.click(); button.click(); })()`);
    await until(() => evaluate("document.querySelector('[role=alert]')?.textContent.includes('Sign-out could not be confirmed')"), "Sign-out failure is truthful and retryable");
    assert.equal(authRequests.filter(request => request.path === "/api/auth/logout").length, logoutBeforeFailure + 1, "A double sign-out attempt sends one request");
    assert.equal(await evaluate("location.pathname"), "/discounts/beehiiv", "Failed sign-out does not falsely redirect as success");
    assert.ok(await evaluate(`!!(${signOutExpression}) && !(${signOutExpression}).disabled`), "Sign-out can be retried after a failure");
    assert.ok(await evaluate("document.documentElement.scrollWidth") <= viewportWidth, "Account menu and error fit the actual device width");
    await screenshot(`saasfolio-auth-signout-error-${label}.png`, false);
    scenario.logout = "success";
    const logoutBeforeRetry = authRequests.filter(request => request.path === "/api/auth/logout").length;
    await evaluate(`(() => { const button = ${signOutExpression}; button.click(); button.click(); })()`);
    await until(() => evaluate("location.pathname === '/login' && !document.querySelector('button[aria-label=\"Open account menu\"]')"), "Successful retry clears the displayed user and returns to sign-in");
    assert.equal(authRequests.filter(request => request.path === "/api/auth/logout").length, logoutBeforeRetry + 1, "A retry remains protected from duplicate requests");
    assert.ok(await evaluate("!document.querySelector('[aria-label=\"Dismiss sign-out error\"]')"), "Successful sign-out clears the earlier failure notice");
    console.log(`Passed ${viewport.width}px: independent email and provider methods, policy and whitespace, duplicate guards, safe returns, generic callback errors, reset email/recovery UI and failed/retried sign-out.`);
  }
  assert.deepEqual(runtimeErrors, [], "No uncaught browser errors");
  assert.deepEqual(interceptionErrors, [], "All mocked requests completed");
  assert.deepEqual(unexpectedWrites, [], "No writes outside intercepted auth fixtures");
  console.log(`Auth UI Chrome smoke passed at 390px and 1440px. ${authRequests.length} mocked auth requests intercepted; no real accounts, sessions, provider authorizations or emails created.`);
} finally {
  for (const entry of pending.values()) clearTimeout(entry.timer);
  chrome.kill(); await new Promise(resolve => chrome.once("exit", resolve));
  await rm(profile, { recursive: true, force: true });
}
