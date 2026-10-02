"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function renameChat(id: string, title: string) {
  const trimmed = title.trim().slice(0, 120);
  if (!trimmed) return;
  const supabase = await createClient();
  await supabase.from("chats").update({ title: trimmed }).eq("id", id);
  revalidatePath("/chat", "layout");
}

export async function deleteChat(id: string) {
  const supabase = await createClient();
  await supabase.from("chats").delete().eq("id", id);
  revalidatePath("/chat", "layout");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
