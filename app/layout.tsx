"use client";

import "./globals.css";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/toast/toaster";
import { Analytics } from "@/components/analytics";
import PostHogProvider from "@/components/providers/posthog-provider";

const inter = Inter({ subsets: ["latin"] });

// Inicializa o cliente Convex
const convexClient = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning={true}>
        <PostHogProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ClerkProvider>
              <ConvexProvider client={convexClient}>
                {children}
                <Toaster />
                <Analytics />
              </ConvexProvider>
            </ClerkProvider>
          </ThemeProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}