export function retryAfterSeconds(value, now = Date.now()) {
  if (!value) return null;
  if (/^\d+$/.test(value.trim())) return Number(value);
  const time = Date.parse(value);
  return Number.isFinite(time) ? Math.max(0, Math.ceil((time - now) / 1000)) : null;
}

export function sourceBackoff(previous, error, now = Date.now()) {
  const failureCount = (previous?.failureCount || 0) + 1;
  const status = error.status || null;
  const blocked = status === 401 || status === 403;
  const seconds = Math.max(error.retryAfterSeconds || 0, blocked ? 86400 : Math.min(43200, 900 * 2 ** Math.min(failureCount - 1, 6)));
  return { failureCount, httpStatus: status, nextAttemptAt: new Date(now + seconds * 1000).toISOString() };
}

export function shouldAttemptSource(source, now = Date.now()) {
  return !source?.nextAttemptAt || !Number.isFinite(Date.parse(source.nextAttemptAt)) || Date.parse(source.nextAttemptAt) <= now;
}
