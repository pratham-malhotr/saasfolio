import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname, extname } from "node:path";
import { createRequire } from "node:module";
import ts from "typescript";

// Run the actual TypeScript catalog in maintenance scripts without another CLI.
export function loadCatalogModule(relativePath) {
  const root = resolve(import.meta.dirname, "../..");
  const nativeRequire = createRequire(import.meta.url);
  const cache = new Map();
  function load(file) {
    if (!extname(file)) file += existsSync(`${file}.ts`) ? ".ts" : ".json";
    if (cache.has(file)) return cache.get(file).exports;
    const loaded = { exports: {} }; cache.set(file, loaded);
    if (file.endsWith(".json")) loaded.exports = JSON.parse(readFileSync(file, "utf8"));
    else {
      const source = ts.transpileModule(readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
      const localRequire = name => name.startsWith("@/") ? load(resolve(root, name.slice(2))) : name.startsWith(".") ? load(resolve(dirname(file), name)) : nativeRequire(name);
      new Function("require", "module", "exports", source)(localRequire, loaded, loaded.exports);
    }
    return loaded.exports;
  }
  return load(resolve(root, relativePath));
}
