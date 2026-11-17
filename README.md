# BIOCAP Rwanda — Official Website

The official website for **BIOCAP Rwanda** (Building Rwandan Capacity for Accelerated Development, Deregulation, and Deployment of Enhanced Crops), a flagship agricultural biotechnology initiative launched December 2025.

🌐 **Live Site:** [https://biocap-rwanda.afs-rwanda.org](https://biocap-rwanda.afs-rwanda.org)

---

## About the Project

BIOCAP Rwanda is a science-driven initiative dedicated to transforming Rwanda's agricultural landscape through biotechnology. This website serves as the official information platform for the programme, covering:

- Biotechnology research on Cassava, Potato, and Banana
- Programme milestones and phase progress
- Environmental stewardship initiatives
- DNA Week news and updates
- Photo gallery of field trials and community engagement

---

## Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org) (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Font:** Geist (via `next/font`)
- **Hosting:** Hostinger

---

## Getting Started

### Prerequisites

Make sure you have **Node.js 18+** installed.

### Installation

```bash
git clone https://github.com/your-username/biocap-rwanda.git
cd biocap-rwanda
npm install
```

### Development

During local development, the frontend first proxies API requests to the local backend at `http://localhost:5000`. If it is not running or cannot be reached, Next.js automatically falls back to the deployed BIOCAP API at `https://biocapapi.afs-rwanda.org`. The local backend's API documentation is available at [Swagger UI](http://localhost:5000/api-docs/#/).
Development and production builds use separate Next.js output directories (`.next-dev` and `.next`) so running a build does not overwrite files used by the dev server.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

To change the local backend origin, set `LOCAL_API_ORIGIN` in `.env.local`. To use a different fallback API, set `NEXT_PUBLIC_API_URL`. The gallery also uses a server-side `GALLERY_API_TOKEN` for its external gallery service; keep that credential server-only and do not prefix it with `NEXT_PUBLIC_`.

### Production Build

```bash
npm run build
npm start
```

---

## Project Structure