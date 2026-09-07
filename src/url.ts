import type { PathParams, QueryParams } from "./types.js";

export function joinURL(baseURL: string | undefined, path: string): string {
  if (!baseURL) return path;
  if (/^https?:\/\//i.test(path)) return path;

  const base = baseURL.replace(/\/+$/, "");
  const next = path.replace(/^\/+/, "");
  return next ? `${base}/${next}` : base;
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
