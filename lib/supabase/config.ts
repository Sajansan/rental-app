export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.");
  }
  let projectUrl: URL;
  try {
    projectUrl = new URL(url);
  } catch {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL must be the Supabase project URL, such as https://<project-ref>.supabase.co.");
  }
  if (projectUrl.pathname !== "/" || projectUrl.search || projectUrl.hash) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL must be the project root URL, without /rest/v1 or other paths.");
  }
  return { url: projectUrl.origin, key };
}
