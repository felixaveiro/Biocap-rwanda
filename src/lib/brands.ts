// src/lib/brands.ts
// Everything that differs between BioCap and AFS Rwanda lives here.

export type NavLink = { label: string; href: string };

export type Brand = {
  id: "biocap" | "alliance";
  name: string;               // short name, e.g. in "BioCap Login"
  fullName: string;           // long name for the header title
  dashboardTitle: string;     // sidebar title
  description: string;        // browser tab / meta description

  // Images (files inside /public)
  logo: string;               // top header logo
  sidebarLogo: string;        // sidebar + login page logo
  favicon: string;
  loginBackground: string;    // login page background image ("" = use gradient)

  // Header
  headerStyle: "nav" | "contact";   // biocap = nav links, alliance = email + phone + menu
  headerBg: string;
  navLinks: NavLink[];
  email: string;
  phone: string;

  // Links
  websiteUrl: string;

  // Colors (injected as CSS variables)
  colors: {
    primary: string;          // main buttons, active sidebar item
    primaryHover: string;
    accent: string;           // gold labels, highlights
    sidebarBg: string;
    loginGradient: string;    // login page background fallback
    loginAccent: string;      // login: "Bio" text, logo ring, focus rings
    loginDark: string;        // login: text and button
    loginLink: string;        // login: Register / Learn more links
  };

  // Public website sections that belong only to this brand
  showPublicPages: boolean;
};

const ALLIANCE_SITE = "https://www.afs-rwanda.org"; // no trailing slash

export const BRANDS: Record<string, Brand> = {
  biocap: {
    id: "biocap",
    name: "BioCap",
    fullName: "Rwanda Biotech Capacity Building (BioCap) Project",
    dashboardTitle: "BioCap Project",
    description: "BioCap Project Dashboard",

    logo: "/image/Rab.png",
    sidebarLogo: "/image/biocap-logo.png",
    favicon: "/image/biocap-logo.png",
    loginBackground: "",

    headerStyle: "nav",
    headerBg: "#ffffff",
    navLinks: [
      { label: "Home", href: "/" },
      { label: "About", href: "/About" },
      { label: "Biotechnology", href: "/Biotech" },
      { label: "Stewardship News", href: "/Stewardship-News" },
      { label: "Gallery", href: "/Gallery" },
      { label: "Resource & Activities", href: "/Resource" },
    ],
    email: "",
    phone: "",

    websiteUrl: "https://biocap-rwanda.afs-rwanda.org",

    colors: {
      primary: "#3F6B4F",
      primaryHover: "#2f5a40",
      accent: "#A9812F",
      sidebarBg: "#FAF9F5",
      loginGradient:
        "linear-gradient(135deg, #133248 0%, #235D74 50%, #632B70 100%)",
      loginAccent: "#E52B67",
      loginDark: "#133248",
      loginLink: "#8b4136",
    },

    showPublicPages: true,
  },

  alliance: {
    id: "alliance",
    name: "AFS Rwanda",
    fullName: "Alliance for Science Rwanda",
    dashboardTitle: "AFS Rwanda",
    description: "AFS Rwanda Dashboard",

    // Files already in biocap/public/image/
    logo: "/image/afs-logo-01.png",        // wide header logo (swap if reversed)
    sidebarLogo: "/image/afs-logo.png",    // small logo for sidebar + login
    favicon: "/image/afs-logo.png",
    loginBackground: "",

    headerStyle: "contact",
    headerBg: "rgba(148, 205, 250, 0.61)",
    navLinks: [
      { label: "Home", href: `${ALLIANCE_SITE}/` },
      { label: "About Us", href: `${ALLIANCE_SITE}/about` },
      { label: "Projects", href: `${ALLIANCE_SITE}/activities` },
      { label: "News & Publications", href: `${ALLIANCE_SITE}/news` },
      { label: "Our Team", href: `${ALLIANCE_SITE}/team` },
      { label: "Gallery", href: `${ALLIANCE_SITE}/Gallery` },
    ],
    email: "rwandaafs@gmail.com",
    phone: "+250 788 667 469",

    websiteUrl: ALLIANCE_SITE,

    colors: {
      primary: "#025496",
      primaryHover: "#01406f",
      accent: "#3b8fd6",
      sidebarBg: "#f1f7fd",
      loginGradient:
        "linear-gradient(135deg, #025496 0%, #3b8fd6 60%, #94cdfa 100%)",
      loginAccent: "#025496",
      loginDark: "#0b2a4a",
      loginLink: "#025496",
    },

    showPublicPages: false,
  },
};

export const DEFAULT_BRAND = "biocap";

export function resolveBrand(id?: string | null): Brand {
  return (id && BRANDS[id]) || BRANDS[DEFAULT_BRAND];
}