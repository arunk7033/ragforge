import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChatView } from "@/components/ChatView";
import { createClient } from "@/lib/supabase/server";
import type { Message } from "@/lib/types";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function generateMetadata({ params }: PageProps<"/chat/[id]">): Promise<Metadata> {
  const { id } = await params;
  if (!UUID.test(id)) return {};
  const supabase = await createClient();
  const { data } = await supabase.from("chats").select("title").eq("id", id).maybeSingle();
  return { title: data ? `${data.title} — ragforge` : "ragforge" };
}

export default async function ChatPage({ params }: PageProps<"/chat/[id]">) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const supabase = await createClient();
  const [{ data: chat }, { data: messages }] = await Promise.all([
    supabase.from("chats").select("id").eq("id", id).maybeSingle(),
    supabase.from("messages").select("id, role, content").eq("chat_id", id).order("created_at"),
  ]);
  if (!chat) notFound();

  return <ChatView key={id} chatId={id} initialMessages={(messages ?? []) as Message[]} />;
}
