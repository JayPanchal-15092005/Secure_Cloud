import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Providers } from "./provider";
import { Analytics } from '@vercel/analytics/next';
import SessionProvider from "@/components/SessionProvider";
import { auth } from "@/auth";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Secure Cloud",
  description: "Secure cloud storage for your (Images, Videos, pdfs)"
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html lang="en" suppressHydrationWarning className={inter.className}>
      <body>
        <SessionProvider session={session}>
          <TooltipProvider>
            <Providers>
              {children}
              <Analytics />
            </Providers>
          </TooltipProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
