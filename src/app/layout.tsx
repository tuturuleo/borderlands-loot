import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { TooltipProvider } from "@/components/ui/tooltip";
import "@fontsource-variable/inter";
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
  title: "Borderlands 4 — База лута",
  description:
    "База данных легендарного и перламутрового лута Borderlands 4: оружие, щиты, гранаты, моды. Поиск, фильтры по производителю, стихиям, источнику.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NuqsAdapter>
          <TooltipProvider delayDuration={150}>{children}</TooltipProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
