import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Header from "@/components/Header";
import { SanityLive } from "@/sanity/lib/live";

export const metadata: Metadata = {
  title: "FindIt Ecommerce",
  description: "A Geo-Location-Based E-Commerce Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <Header />
          {children}
          <SanityLive />
        </body>
      </html>
    </ClerkProvider>
  );
}