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
  title: {
    default: "BIOCAP Rwanda",
    template: "%s | BIOCAP Rwanda",
  },
  description:
    "Building Rwandan Capacity for accelerated development and deployment of enhanced crops for food security across Rwanda.",
  keywords: [
    "BIOCAP Rwanda",
    "BioCap",
    "crop biotechnology Rwanda",
    "CRISPR agriculture Rwanda",
    "food security Rwanda",
    "AFS Rwanda",
  ],
  icons: {
    icon: "/image/biocap-logo.png",
  },
  verification: {
    google: "KCG0wvJqn9U3Qxr7UdPuwt_sN79EDPZl17hZGkV02oM",
  },
  openGraph: {
    title: "BIOCAP Rwanda",
    description:
      "Building Rwandan Capacity for accelerated development and deployment of enhanced crops.",
    url: "https://biocap-rwanda.afs-rwanda.org",
    siteName: "BIOCAP Rwanda",
    locale: "en_US",
    type: "website",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "BIOCAP Rwanda",
  url: "https://biocap-rwanda.afs-rwanda.org",
  description:
    "Building Rwandan Capacity for accelerated development and deployment of enhanced crops for food security.",
  address: {
    "@type": "PostalAddress",
    addressCountry: "RW",
    addressLocality: "Huye",
  },
  sameAs: [
    "https://x.com/RwandaBioCap",
    "https://www.linkedin.com/company/rwanda-biocap-progam/",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}