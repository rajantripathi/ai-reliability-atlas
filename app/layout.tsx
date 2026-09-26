import type { Metadata } from "next";
import { headers } from "next/headers";
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

export async function generateMetadata(): Promise<Metadata> {
 const requestHeaders = await headers();
 const host = requestHeaders.get('host') || 'localhost:3000';
 const scheme = host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https';
 return {
  metadataBase: new URL(`${scheme}://${host}`),
  title: "AI Reliability Atlas — Rajan Tripathi",
  description: "Explore three applied AI experiments in knowledge coverage, visual evidence and human authority. Inspect the measurements, limitations and engineering decisions.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
  },
  openGraph: { title: "Where AI breaks. What the evidence says.", description: "Three interactive experiments in knowledge, perception and authority by Rajan Tripathi, PhD.", images: [{url:'/og.png',alt:'AI Reliability Atlas — Where AI breaks. What the evidence says.'}], type:'website'},
  twitter: {card:'summary_large_image',title:'AI Reliability Atlas',description:'Explore the evidence behind applied AI reliability.',images:['/og.png']},
};
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
