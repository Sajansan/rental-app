import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const token_hash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");
  const destination = new URL("/login?error=confirmation", request.url);
  if (token_hash && type === "email") {
    try {
      const supabase = await createClient(true);
      const { error } = await supabase.auth.verifyOtp({ token_hash, type: "email" });
      if (!error) destination.search = "";
    } catch {
      // Keep the fixed failure destination; never redirect to arbitrary input.
      console.error("Email confirmation failed to reach Supabase.");
    }
  }
  const response = NextResponse.redirect(destination);
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
