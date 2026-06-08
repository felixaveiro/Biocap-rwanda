import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BIOCAP Rwanda",
  description:
    "Building Rwandan Capacity for accelerated development and deployment of enhanced crops.",
  icons: {
    icon: "/image/biocap-logo.png",
  },
 verification: {
  google: "KCG0wvJqn9U3Qxr7UdPuwt_sN79EDPZl17hZGkV02oM",
},
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
        
        <Navbar />
        
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}