import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Providers } from "./provider";

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
    <html lang="en" suppressHydrationWarning>
      <body>
        <TooltipProvider>
         <Providers>
          {children}
         </Providers>
        </TooltipProvider>
      </body>
    </html>
    </ClerkProvider>
  );
}
