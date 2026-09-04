import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-source-serif",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nextmove.thedirectorloop.com"),
  title: "NextMove",
  description:
    "Talk it through with an AI coach for about ten minutes. You leave with a chosen path, an honest realism read, and the first message to someone you already know.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    url: "https://nextmove.thedirectorloop.com",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${sourceSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-canvas text-ink font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
