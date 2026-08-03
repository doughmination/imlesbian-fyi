import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter } from "next/font/google";
import "./globals.css";

const display = localFont({
  src: "./fonts/MapleMono-Light.woff2",
  variable: "--font-display",
  weight: "300",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500"],
});

const mono = localFont({
  src: [
    {
      path: "./fonts/SF-Mono-Regular.otf",
      weight: "400",
    },
    {
      path: "./fonts/SF-Mono-Medium.otf",
      weight: "500",
    },
  ],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "imlesbian.fyi",
  description: "Your tiny queer corner of the internet.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} ${mono.variable}`}>
        {children}
      </body>
    </html>
  );
}