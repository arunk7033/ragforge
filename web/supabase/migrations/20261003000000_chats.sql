-- Chat history for the web app. Run in the Supabase SQL editor or with `supabase db push`.

create table public.chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null default 'New chat' check (char_length(title) between 1 and 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null check (char_length(content) between 1 and 32000),
  created_at timestamptz not null default now()
);

create index chats_user_updated_idx on public.chats (user_id, updated_at desc);
create index messages_chat_created_idx on public.messages (chat_id, created_at);

alter table public.chats enable row level security;
alter table public.messages enable row level security;

create policy "Users manage their own chats" on public.chats
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users manage messages in their own chats" on public.messages
  for all to authenticated
  using (exists (select 1 from public.chats c where c.id = chat_id and c.user_id = (select auth.uid())))
  with check (exists (select 1 from public.chats c where c.id = chat_id and c.user_id = (select auth.uid())));
