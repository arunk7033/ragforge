import type { Metadata } from "next";
import { ChatView } from "@/components/ChatView";

export const metadata: Metadata = { title: "New chat — ragforge" };

export default function NewChatPage() {
  return <ChatView key="new" initialMessages={[]} />;
}
