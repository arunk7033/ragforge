"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useSyncExternalStore, useTransition } from "react";
import { deleteChat, renameChat, signOut } from "@/app/chat/actions";
import { Logo } from "@/components/Logo";
import type { ChatSummary } from "@/lib/types";

type SidebarUser = { email: string | null; name: string | null; avatarUrl: string | null };

const GROUPS = ["Today", "Yesterday", "Previous 7 days", "Older"] as const;

const subscribeNever = () => () => {};

function groupOf(updatedAt: string, now: Date): (typeof GROUPS)[number] {
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const day = 24 * 60 * 60 * 1000;
  const t = new Date(updatedAt).getTime();
  if (t >= startOfToday) return "Today";
  if (t >= startOfToday - day) return "Yesterday";
  if (t >= startOfToday - 7 * day) return "Previous 7 days";
  return "Older";
}

function ChatItem({ chat, active, onNavigate }: { chat: ChatSummary; active: boolean; onNavigate: () => void }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(chat.title);
  const [pending, startTransition] = useTransition();

  function save() {
    setEditing(false);
    if (title.trim() && title.trim() !== chat.title) startTransition(() => renameChat(chat.id, title));
    else setTitle(chat.title);
  }

  function remove() {
    if (!confirm(`Delete "${chat.title}"?`)) return;
    startTransition(async () => {
      await deleteChat(chat.id);
      if (active) router.push("/chat");
    });
  }

  if (editing) {
    return (
      <input
        autoFocus
        value={title}
        maxLength={120}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === "Enter") save();
          if (e.key === "Escape") {
            setTitle(chat.title);
            setEditing(false);
          }
        }}
        className="w-full rounded-xl border border-green bg-white/10 px-3 py-2 text-sm text-white focus:outline-none"
        aria-label="Chat title"
      />
    );
  }

  return (
    <div
      className={`group flex items-center rounded-xl text-sm transition ${
        active ? "bg-white/15 text-white" : "text-white/75 hover:bg-white/10 hover:text-white"
      } ${pending ? "opacity-50" : ""}`}
    >
      <Link href={`/chat/${chat.id}`} onClick={onNavigate} className="min-w-0 flex-1 truncate px-3 py-2" title={chat.title}>
        {chat.title}
      </Link>
      <div className="flex shrink-0 gap-0.5 pr-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
        <button type="button" onClick={() => setEditing(true)} className="rounded-lg p-1.5 hover:bg-white/15" aria-label={`Rename ${chat.title}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M12 20h9M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4z" />
          </svg>
        </button>
        <button type="button" onClick={remove} className="rounded-lg p-1.5 hover:bg-white/15" aria-label={`Delete ${chat.title}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export function Sidebar({ chats, user }: { chats: ChatSummary[]; user: SidebarUser }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // Grouping uses the browser's timezone, so it's skipped during server rendering.
  const today = useSyncExternalStore(subscribeNever, () => new Date().toDateString(), () => null);
  const now = today ? new Date(today) : null;

  const grouped = GROUPS.map((label) => ({
    label,
    items: now ? chats.filter((c) => groupOf(c.updated_at, now) === label) : label === "Today" ? chats : [],
  })).filter((g) => g.items.length > 0);

  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed left-3 top-3 z-30 rounded-xl border border-dark bg-white p-2.5 md:hidden"
        aria-label="Open sidebar"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {open && <div className="fixed inset-0 z-40 bg-dark/40 md:hidden" onClick={close} aria-hidden="true" />}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-dark text-white transition-transform md:static md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 pb-3 pt-5">
          <Logo inverted size={22} />
          <button type="button" onClick={close} className="rounded-lg p-1.5 hover:bg-white/10 md:hidden" aria-label="Close sidebar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <div className="px-3 pb-3">
          <Link
            href="/chat"
            onClick={close}
            className="flex items-center gap-2 rounded-xl bg-green px-4 py-2.5 font-medium text-dark transition hover:brightness-95"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New chat
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4" aria-label="Previous chats">
          {grouped.length === 0 && <p className="px-3 py-2 text-sm text-white/50">No chats yet.</p>}
          {grouped.map((group) => (
            <div key={group.label} className="mb-4">
              <h2 className="px-3 pb-1 text-xs uppercase tracking-[0.15em] text-white/40">{group.label}</h2>
              <ul className="flex flex-col gap-0.5">
                {group.items.map((chat) => (
                  <li key={chat.id}>
                    <ChatItem chat={chat} active={pathname === `/chat/${chat.id}`} onNavigate={close} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-3 border-t border-white/10 px-4 py-4">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatarUrl} alt="" width={32} height={32} className="h-8 w-8 rounded-full" referrerPolicy="no-referrer" />
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green text-sm font-medium text-dark">
              {(user.name ?? user.email ?? "?").charAt(0).toUpperCase()}
            </span>
          )}
          <div className="min-w-0 flex-1">
            {user.name && <p className="truncate text-sm">{user.name}</p>}
            <p className="truncate text-xs text-white/60">{user.email}</p>
          </div>
          <form action={signOut}>
            <button type="submit" className="rounded-lg px-2 py-1.5 text-xs text-white/70 hover:bg-white/10 hover:text-white">
              Sign out
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
