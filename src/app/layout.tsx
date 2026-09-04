import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import "@/app/globals.css";
import Navbar from "@/components/Navbar";

// Declare custom Google Fonts once at the root level
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-mono",
  display: "swap",
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
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} ${fraunces.variable} ${inter.variable} ${plexMono.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="antialiased">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}