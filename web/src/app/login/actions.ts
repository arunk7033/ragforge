"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseConfigured } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";

export async function signInWithGoogle() {
  if (!supabaseConfigured) redirect("/login?error=config");

  const origin = (await headers()).get("origin");
  if (!origin) redirect("/login?error=auth");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback` },
  });

  if (error || !data.url) redirect("/login?error=auth");
  redirect(data.url);
}
