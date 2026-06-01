import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import SafetyBanner from "@/components/SafetyBanner";
import LoadingScreen from "@/components/LoadingScreen";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chemistry Archive",
  description:
    "A searchable, tagged archive of chemistry videos — reactions, reagents, products, techniques and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100">
        <LoadingScreen />
        <header className="sticky top-0 z-20 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
          <div className="max-w-7xl mx-auto px-5 py-3 flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight whitespace-nowrap">
              <span className="text-emerald-400">⚗</span>
              <span>Chemistry Archive</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm text-zinc-400">
              <Link href="/" className="hover:text-emerald-300 transition-colors">Browse</Link>
              <Link href="/playlists/" className="hover:text-emerald-300 transition-colors">Playlists</Link>
            </nav>
          </div>
        </header>
        <SafetyBanner />
        <main className="flex-1 max-w-7xl w-full mx-auto px-5 py-6">{children}</main>
        <footer className="border-t border-zinc-800 text-center text-xs text-zinc-600 py-4">
          Archived chemistry videos · preserved for learning
        </footer>
      </body>
    </html>
  );
}
