import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  let destination = "/reset-password?error=invalid-link";
  if (code) {
    try {
      const supabase = await createClient(true);
      const flowId = request.nextUrl.searchParams.get("sb_flow_id");
      const { data, error } = await supabase.auth.exchangeCodeForSession(code, flowId ? { flowId } : undefined);
      if (!error && data.user) destination = "redirectType" in data && data.redirectType === "recovery" ? "/reset-password" : "/login";
    } catch {
      console.error("Auth callback failed to exchange the authorization code.");
    }
  }
  const response = NextResponse.redirect(new URL(destination, request.url));
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
