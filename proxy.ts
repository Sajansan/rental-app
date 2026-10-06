import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseConfig } from "@/lib/supabase/config";

export async function proxy(request: NextRequest) {
  const { url, key } = getSupabaseConfig();
  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        const previousCookies = response.cookies.getAll();
        response = NextResponse.next({ request });
        previousCookies.forEach((cookie) => response.cookies.set(cookie));
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
        Object.entries(headers).forEach(([name, value]) => response.headers.set(name, value));
      },
    },
  });

  // Refresh only here; authorization is repeated next to protected page data.
  try {
    await supabase.auth.getClaims();
  } catch {
    // Pages/actions report service failures and never grant access on failure.
    console.error("Supabase session refresh failed.");
  }
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = {
  matcher: ["/login", "/register", "/forgot-password", "/reset-password", "/customer/:path*", "/admin/:path*", "/auth/:path*"],
};
