import { config, supabaseConfigured } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";

const HISTORY_LIMIT = 20;
const MAX_MESSAGE_LENGTH = 8000;

function jsonError(status: number, error: string) {
  return Response.json({ error }, { status });
}

export async function POST(request: Request) {
  if (!supabaseConfigured) return jsonError(503, "Sign-in isn't configured");

  const body = (await request.json().catch(() => null)) as { chatId?: unknown; message?: unknown } | null;
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  if (!message) return jsonError(400, "Message is required");
  if (message.length > MAX_MESSAGE_LENGTH) return jsonError(400, `Messages are limited to ${MAX_MESSAGE_LENGTH} characters`);

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!claims?.claims || !session) return jsonError(401, "Not signed in");

  let chatId = typeof body?.chatId === "string" ? body.chatId : null;
  const isNewChat = !chatId;
  if (chatId) {
    const { data: chat } = await supabase.from("chats").select("id").eq("id", chatId).maybeSingle();
    if (!chat) return jsonError(404, "Chat not found");
  } else {
    const title = message.replace(/\s+/g, " ").slice(0, 60);
    const { data: chat, error } = await supabase.from("chats").insert({ title }).select("id").single();
    if (error || !chat) return jsonError(500, "Couldn't create chat");
    chatId = chat.id as string;
  }

  const { data: userMessage, error: insertError } = await supabase
    .from("messages")
    .insert({ chat_id: chatId, role: "user", content: message })
    .select("id")
    .single();
  if (insertError || !userMessage) return jsonError(500, "Couldn't save message");

  const { data: history } = await supabase
    .from("messages")
    .select("role, content")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: false })
    .limit(HISTORY_LIMIT);

  const upstream = await fetch(`${config.backendUrl}/v1/chat/stream`, {
    method: "POST",
    headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, messages: (history ?? []).reverse() }),
    signal: request.signal,
  }).catch(() => null);

  if (!upstream?.ok || !upstream.body) {
    if (isNewChat) await supabase.from("chats").delete().eq("id", chatId);
    else await supabase.from("messages").delete().eq("id", userMessage.id);
    return jsonError(502, "The ragforge backend isn't reachable. Is it running on BACKEND_URL?");
  }

  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let reply = "";
      let failed = false;
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          reply += decoder.decode(value, { stream: true });
          controller.enqueue(value);
        }
      } catch {
        failed = true;
      }
      reply = (reply + decoder.decode()).trim();

      if (reply) {
        await supabase.from("messages").insert({ chat_id: chatId, role: "assistant", content: reply });
      }
      await supabase.from("chats").update({ updated_at: new Date().toISOString() }).eq("id", chatId);

      try {
        if (failed) controller.error(new Error("Stream interrupted"));
        else controller.close();
      } catch {
        // Client already disconnected.
      }
    },
    cancel() {
      reader.cancel().catch(() => {});
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Chat-Id": chatId!,
    },
  });
}
