import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://cdzhlxmlvuffihfyepzl.supabase.co";
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkemhseG1sdnVmZmloZnllcHpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5MDAwODQsImV4cCI6MjEwNTQ3NjA4NH0.6_8vUHxLIkx_a8BVT5Joj2HngqOfC8yD3lDQlWxMHUM";

  return createBrowserClient(supabaseUrl, supabaseKey);
}
