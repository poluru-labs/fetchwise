import type { BaseURLConfig, PathParams, QueryParams } from "./types.js";

export function isAbsoluteURL(value: string): boolean {
  return /^[a-z][a-z0-9+.-]*:/i.test(value);
}

export function joinURL(baseURL: string | undefined, path: string): string {
  if (!baseURL) return path;
  if (isAbsoluteURL(path)) return path;

  const base = baseURL.replace(/\/+$/, "");
  const next = path.replace(/^\/+/, "");
  return next ? `${base}/${next}` : base;
}

export function mergeBaseURL(
  current?: BaseURLConfig,
  next?: BaseURLConfig,
): BaseURLConfig | undefined {
  if (next === undefined) return current;
  if (current === undefined) return next;

  const currentMap = typeof current === "string" ? { default: current } : current;
  const nextMap = typeof next === "string" ? { default: next } : next;
  return { ...currentMap, ...nextMap };
}

/**
 * Pick a host from a string, a named map, or a per-request override.
 *
 * - `baseURL: "https://api.app.com"` is the default host
 * - `baseURL: { default, auth, payments }` maps names to different APIs
 * - request `{ baseURL: "auth" }` selects a named host
 * - request `{ baseURL: "https://other.com" }` uses that host for one call
 */
export function resolveBaseURL(
  configured?: BaseURLConfig,
  override?: string,
): string | undefined {
  if (override && isAbsoluteURL(override)) return override;

  if (typeof configured === "string" || configured == null) {
    return override ?? configured;
  }

  if (override) {
    const named = configured[override];
    if (named) return named;

    const names = Object.keys(configured).join(", ");
    throw new Error(
      `Unknown baseURL "${override}". Known names: ${names || "(none)"}`,
    );
  }

  return configured.default;
}

export function applyParams(path: string, params?: PathParams): string {
  if (!params) return path;

  return path.replace(/:([A-Za-z_][A-Za-z0-9_]*)/g, (match, key: string) => {
    if (!(key in params)) return match;
    return encodeURIComponent(String(params[key]));
  });
}

export function applyQuery(url: string, query?: QueryParams): string {
  if (!query) return url;

  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    const values = Array.isArray(value) ? value : [value];
    for (const item of values) {
      if (item == null) continue;
      search.append(key, String(item));
    }
  }

  const qs = search.toString();
  if (!qs) return url;
  return url.includes("?") ? `${url}&${qs}` : `${url}?${qs}`;
}

export function resolveURL(
  baseURL: string | undefined,
  path: string,
  params?: PathParams,
  query?: QueryParams,
): string {
  return applyQuery(joinURL(baseURL, applyParams(path, params)), query);
}
