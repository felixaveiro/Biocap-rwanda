import type { Metadata } from "next";
import { cookies } from "next/headers";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import "@/app/globals.css";
import Navbar from "@/components/Navbar";
import { BrandProvider } from "@/components/BrandProvider";
import { resolveBrand } from "@/lib/brands";

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

// Reads the "brand" cookie set by middleware (?brand=alliance / ?brand=biocap)
async function getBrand() {
  const store = await cookies();
  return resolveBrand(store.get("brand")?.value);
}

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrand();

  // AFS Rwanda: own title, description and icon
  if (brand.id === "alliance") {
    return {
      title: {
        default: `${brand.name} Dashboard`,
        template: `%s | ${brand.name}`,
      },
      description: brand.description,
      icons: { icon: brand.favicon },
    };
  }

  // BioCap: exactly your original metadata
  return {
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
      icon: brand.favicon,
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
}

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const brand = await getBrand();
  const c = brand.colors;

  // CSS variables used by Sidebar, Header and other dashboard components
  const cssVars = {
    "--color-primary": c.primary,
    "--color-primary-hover": c.primaryHover,
    "--color-primary-soft": `color-mix(in srgb, ${c.primary} 10%, transparent)`,
    "--color-accent": c.accent,
    "--color-sidebar-bg": c.sidebarBg,
  } as React.CSSProperties;

  return (
    <html
      lang="en"
      data-brand={brand.id}
      className={`${GeistSans.variable} ${GeistMono.variable} ${fraunces.variable} ${inter.variable} ${plexMono.variable}`}
    >
      <head>
        {/* BioCap SEO data only; not relevant for AFS */}
        {brand.id === "biocap" && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          />
        )}
      </head>
      <body className="antialiased" style={cssVars}>
        <BrandProvider brand={brand}>
          <Navbar />
          <main>{children}</main>
        </BrandProvider>
      </body>
    </html>
  );
}