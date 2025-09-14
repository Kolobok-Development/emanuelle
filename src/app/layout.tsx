import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TelegramSDKInitProvider from "@/components/TelegramSDKInitProvider/TelegramSDK";
import { AppProvider } from "@/contexts/AppContext";
import { AppRoot } from "@telegram-apps/telegram-ui";
import { Root } from "@/components/Root/Root";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Emanuelle - AI Chat Companion",
  description: "Your personal AI chat companion on Telegram",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body>
        <TelegramSDKInitProvider>
          <Root>{children}</Root>
        </TelegramSDKInitProvider>
      </body>
    </html>
  );
}
