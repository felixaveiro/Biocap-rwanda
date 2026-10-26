import Link from 'next/link';
import type { Metadata } from 'next';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Page not found',
  description: 'The page you are looking for does not exist or has moved.',
};

export default function NotFound() {
  return (
    <>
      <section className="flex min-h-[70vh] items-center bg-[#FAF9F5] px-4 py-24 sm:px-6">
        <div className="mx-auto w-full max-w-2xl text-center">
          <p className="font-mono text-sm uppercase tracking-widest text-[#3F6B4F]">Error 404</p>
          <h1 className="mt-4 font-display text-4xl text-[#1E2620] sm:text-5xl">Page not found</h1>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-[#5A6259]">
            The page you are looking for does not exist or has moved. Try returning to the home page.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex items-center rounded-full bg-[#1E2620] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#3F6B4F]"
            >
              Back to home
            </Link>
            <Link
              href="/Stewardship-News"
              className="inline-flex items-center rounded-full border border-[#D9D4C6] px-6 py-3 text-sm font-medium text-[#1E2620] transition hover:border-[#3F6B4F] hover:text-[#3F6B4F]"
            >
              Read the news
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
