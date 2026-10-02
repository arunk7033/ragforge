import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const grotesk = localFont({
  variable: "--font-grotesk",
  display: "swap",
  src: [
    { path: "../fonts/SpaceGrotesk-Regular.woff", weight: "400" },
    { path: "../fonts/SpaceGrotesk-Medium.woff", weight: "500" },
  ],
});

export const metadata: Metadata = {
  title: "ragforge",
  description: "Sign in to your ragforge workspace.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${grotesk.variable} h-full antialiased`}>
      <body className="min-h-full bg-white text-dark">{children}</body>
    </html>
  );
}
