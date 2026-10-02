import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { createClient, getUser } from "@/lib/supabase/server";
import type { ChatSummary } from "@/lib/types";

export default async function ChatLayout({ children }: LayoutProps<"/chat">) {
  const user = await getUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const { data } = await supabase
    .from("chats")
    .select("id, title, updated_at")
    .order("updated_at", { ascending: false })
    .limit(200);

  return (
    <div className="flex h-dvh overflow-hidden">
      <Sidebar chats={(data ?? []) as ChatSummary[]} user={user} />
      <main className="flex min-w-0 flex-1 flex-col">{children}</main>
    </div>
  );
}
