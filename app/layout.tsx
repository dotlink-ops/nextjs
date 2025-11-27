import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Avidelta",
  description: "Avidelta — advisory & ops systems.",
  // Prevent staging/non-production deployments from being indexed
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-black`}
      >
        <div className="flex min-h-screen flex-col">
          <main className="flex-1">{children}</main>
          <footer className="border-t border-black/5 bg-gray-50 px-6 py-4 text-sm text-gray-700">
            <div className="mx-auto flex max-w-5xl flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-medium">Avidelta</span>
              <div className="flex gap-4">
                <a className="hover:underline" href="/privacy">
                  Privacy Policy
                </a>
                <a className="hover:underline" href="/terms">
                  Terms of Service
                </a>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
