import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import Link from "next/link";
import { SourceCitation } from "@/components/SourceCitation";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "MedCode — Medical Coding & Billing Platform",
  description:
    "Search ICD-10 and HCPCS codes by symptom, condition, or procedure. Modifiers, crosswalks, CCI edits, fee schedules, and more.",
};

const navItems = [
  { href: "/", label: "Search" },
  { href: "/guided", label: "Guided Flow" },
  { href: "/modifiers", label: "Modifiers" },
  { href: "/cci-edits", label: "CCI Edits" },
  { href: "/fee-schedule", label: "Fee Schedule" },
  { href: "/em-calculator", label: "E/M Calculator" },
  { href: "/denials", label: "Denials" },
  { href: "/updates", label: "Updates" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${dmSans.variable} font-sans antialiased`}>
        <nav className="flex items-center justify-between border-b border-border-light px-7 py-3.5">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-text-primary text-lg font-light text-white">
              +
            </div>
            <span className="font-display text-xl">MedCode</span>
          </Link>
          <div className="flex gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3.5 py-2 text-sm text-text-secondary transition-colors hover:bg-bg"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
        <main>{children}</main>
        <SourceCitation />
      </body>
    </html>
  );
}
