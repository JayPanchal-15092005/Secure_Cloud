import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Providers } from "./provider";
import { Analytics } from '@vercel/analytics/next';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Secure Cloud",
  description: "Secure cloud storage for your (Images, Videos, pdfs)"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
    <html lang="en" suppressHydrationWarning className={inter.className}>
      <body>
        <TooltipProvider>
         <Providers>
          {children}
          <Analytics />
         </Providers>
        </TooltipProvider>
      </body>
    </html>
    </ClerkProvider>
  );
}
