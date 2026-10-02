"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Message } from "@/lib/types";

const SUGGESTIONS = ["What is retrieval-augmented generation?", "How does hybrid search work?", "How should I chunk PDFs?"];

export function ChatView({ chatId, initialMessages }: { chatId?: string; initialMessages: Message[] }) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  useEffect(() => () => abortRef.current?.abort(), []);

  function resize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }

  async function send(text: string) {
    const message = text.trim();
    if (!message || streaming) return;

    setError(null);
    setInput("");
    requestAnimationFrame(resize);
    const assistantId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: message },
      { id: assistantId, role: "assistant", content: "" },
    ]);
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;
    let newChatId: string | null = null;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId, message }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Something went wrong. Please try again.");
      }

      if (!chatId) {
        newChatId = res.headers.get("X-Chat-Id");
        router.refresh();
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + chunk } : m)));
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
        setMessages((prev) => prev.filter((m) => !(m.id === assistantId && !m.content)));
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
      if (newChatId) router.replace(`/chat/${newChatId}`);
      else router.refresh();
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center gap-8 px-5 text-center">
            <h1 className="text-3xl font-medium sm:text-4xl">
              What can I help you <span className="greenhead">find</span>?
            </h1>
            <div className="flex flex-wrap justify-center gap-3">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-2xl border border-dark px-4 py-2.5 text-sm transition hover:bg-dark hover:text-white"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-6 px-5 pb-6 pt-16 md:pt-8">
            {messages.map((m) =>
              m.role === "user" ? (
                <div key={m.id} className="ml-auto max-w-[85%] whitespace-pre-wrap rounded-3xl bg-gray px-5 py-3">
                  {m.content}
                </div>
              ) : (
                <div key={m.id} className="flex gap-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-dark text-xs font-medium text-green">
                    rf
                  </span>
                  <div className="min-w-0 flex-1 whitespace-pre-wrap leading-relaxed">
                    {m.content || <span className="inline-block h-4 w-2 animate-pulse bg-dark align-middle" aria-label="Thinking" />}
                  </div>
                </div>
              ),
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="px-4 pb-4 pt-2">
        {error && (
          <p className="mx-auto mb-3 max-w-3xl rounded-[14px] border border-dark bg-green px-4 py-3 text-sm" role="alert">
            {error}
          </p>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="mx-auto flex max-w-3xl items-end gap-2 rounded-[28px] border border-dark bg-white p-2 shadow-card"
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              resize();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                send(input);
              }
            }}
            rows={1}
            maxLength={8000}
            placeholder="Message ragforge"
            className="max-h-[200px] flex-1 resize-none bg-transparent px-4 py-2.5 placeholder:text-dark/40 focus:outline-none"
            aria-label="Message"
          />
          {streaming ? (
            <button
              type="button"
              onClick={() => abortRef.current?.abort()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-dark text-white"
              aria-label="Stop generating"
            >
              <span className="h-3.5 w-3.5 rounded-sm bg-white" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-dark text-white transition hover:bg-green hover:text-dark disabled:opacity-30"
              aria-label="Send message"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </button>
          )}
        </form>
        <p className="mt-2 text-center text-xs text-dark/50">
          Answers are placeholders until retrieval and generation are connected.
        </p>
      </div>
    </div>
  );
}
