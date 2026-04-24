import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { TopBar } from "@/components/TopBar";
import { Footer } from "@/components/Footer";
import { createRosterService } from "@/services/createRosterService";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body-var",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rosterpulse.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "RosterPulse — NFL Roster Dashboard",
    template: "%s | RosterPulse",
  },
  description:
    "Real-time NFL roster and depth chart dashboard. Every team, every starter, every status change — updated daily.",
  keywords: [
    "NFL", "roster", "depth chart", "injuries", "NFL draft", "fantasy football",
    "NFL news", "roster moves", "NFL trades", "NFL schedule",
  ],
  openGraph: {
    type: "website",
    siteName: "RosterPulse",
    title: "RosterPulse — NFL Roster Dashboard",
    description:
      "Real-time NFL roster and depth chart dashboard. Every team, every starter, every status change.",
    url: SITE_URL,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "RosterPulse — NFL Roster Dashboard",
    description:
      "Real-time NFL roster and depth chart dashboard. Every team, every starter, every status change.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const service = createRosterService();
  const lastVerified = await service.getLastVerified();

  return (
    <html lang="en">
      <body className={`${inter.variable} font-body antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "RosterPulse",
              url: SITE_URL,
              description:
                "Real-time NFL roster and depth chart dashboard. Every team, every starter, every status change.",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <TopBar lastVerified={lastVerified} />
        <main className="min-h-[calc(100vh-49px-37px)]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
