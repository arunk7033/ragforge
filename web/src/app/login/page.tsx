import type { Metadata } from "next";
import { Logo } from "@/components/Logo";
import { config, supabaseConfigured } from "@/lib/config";
import { signInWithGoogle } from "./actions";

export const metadata: Metadata = { title: "Log in — ragforge" };

const errors: Record<string, string> = {
  auth: "Google sign-in didn't complete. Please try again.",
  config:
    "Sign-in isn't configured yet. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in web/.env.local.",
};

function GoogleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { error } = await searchParams;
  const message = !supabaseConfigured ? errors.config : typeof error === "string" ? errors[error] : undefined;

  return (
    <main className="mx-auto flex min-h-dvh max-w-6xl flex-col px-5 py-8 sm:px-10">
      <a href={config.siteUrl} className="w-fit" aria-label="ragforge home">
        <Logo />
      </a>

      <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-2">
        <div className="card flex flex-col gap-8 bg-gray p-8 sm:p-12">
          <div className="flex flex-col gap-3">
            <h1 className="text-4xl font-medium">
              Welcome <span className="greenhead">back</span>
            </h1>
            <p className="text-lg">Sign in with your Google account to open your workspace.</p>
          </div>

          <form action={signInWithGoogle}>
            <button type="submit" disabled={!supabaseConfigured} className="btn-secondary w-full gap-3 bg-white px-6 py-4">
              <GoogleIcon />
              Continue with Google
            </button>
          </form>

          {message && (
            <p className="rounded-[14px] border border-dark bg-green px-5 py-4" role="alert">
              {message}
            </p>
          )}

          <p className="text-sm text-dark/60">
            New accounts are created automatically on first sign-in.
          </p>
        </div>

        <div className="hidden flex-col gap-8 rounded-card bg-dark p-12 text-white lg:flex">
          <span className="w-fit rounded-full border border-white/40 px-4 py-1.5 text-sm">Early preview</span>
          <ul className="flex flex-col gap-6 text-xl">
            {[
              "Chat interface with your conversation history saved",
              "Rename and delete past chats from the sidebar",
              "Answers are placeholders until retrieval and generation are connected",
            ].map((item) => (
              <li key={item} className="flex gap-4">
                <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green text-sm text-dark">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
