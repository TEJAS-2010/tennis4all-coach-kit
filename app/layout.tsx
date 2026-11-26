import type { Metadata } from "next";
import { Geist_Mono, Noto_Sans } from "next/font/google";

import "./globals.css";

const sans = Noto_Sans({
  subsets: ["latin", "devanagari"],
  variable: "--font-sans",
  display: "swap",
});

const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tennis4All Coach Kit",
  description:
    "Session plans for volunteer tennis coaches when the group is bigger than the kit.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
