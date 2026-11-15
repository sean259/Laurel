import type { Metadata } from "next";
import Link from "next/link";
import { Fraunces, Inter } from "next/font/google";
import { LaurelMark } from "@/components/LaurelMark";
import { UserMenu } from "@/components/UserMenu";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });

export const metadata: Metadata = {
  title: "Laurel — where champions are crowned",
  description: "Create and run brackets for any game or sport.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="flex min-h-screen flex-col bg-zinc-50 font-sans text-zinc-900 antialiased">
        <header className="border-b border-zinc-200 bg-white/80 backdrop-blur">
          <nav className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:gap-6">
            <Link href="/" className="flex items-center gap-2 font-display text-xl font-semibold">
              <LaurelMark className="h-6 w-6 text-amber-500" />
              Laurel
            </Link>
            <Link href="/tournaments" className="text-sm text-zinc-600 hover:text-zinc-900">
              Tournaments
            </Link>
            <Link
              href="/tournaments/new"
              className="ml-auto whitespace-nowrap rounded-full bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-zinc-700"
            >
              <span className="sm:hidden">+ New</span>
              <span className="hidden sm:inline">New tournament</span>
            </Link>
            <UserMenu />
          </nav>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
        <footer className="border-t border-zinc-200 py-6 text-center text-sm text-zinc-500">
          © {new Date().getFullYear()} Laurel · Where champions are crowned
        </footer>
      </body>
    </html>
  );
}
