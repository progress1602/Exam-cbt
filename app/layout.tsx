import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cloudnotte Jamb CBT",
  description: "Prepare for your Exams with ease using Cloudnotte CBT Practice",
};

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
         {/* <div className="text-white bg-white dark: dark:bg-black  text-2xl md:text-3xl lg:text-3xl flex items-center justify-center">Cloudnotte Jamb CBT</div> */}
        {children}
        <Toaster position="top-right" richColors/>
      </body>
    </html>
  );
}
