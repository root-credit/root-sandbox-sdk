import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { branding } from "@/lib/branding";
import "./globals.css";

export const metadata: Metadata = {
  title: `${branding.productName} — ${branding.tagline}`,
  description: branding.tagline,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-background">
      <head>
        <link 
          rel="stylesheet" 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" 
        />
      </head>
      <body className="min-h-screen font-sans antialiased bg-background text-foreground">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
