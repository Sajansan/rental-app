// Fixed local destinations prevent auth links from becoming open redirects.
export function authLinkDestination(href: string): string | null {
  const url = new URL(href);
  if (url.pathname === "/reset-password" || url.pathname.startsWith("/auth/")) return null;
  const fragment = new URLSearchParams(url.hash.slice(1));
  if (fragment.get("type") === "recovery" || url.searchParams.get("type") === "recovery" || (url.pathname === "/" && fragment.has("error_code"))) {
    return `/reset-password${url.search}${url.hash}`;
  }
  if (url.searchParams.has("code")) return `/auth/callback${url.search}`;
  return null;
}
