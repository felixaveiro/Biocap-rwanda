'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="flex min-h-[70vh] items-center bg-[#FAF9F5] px-4 py-24 sm:px-6">
      <div className="mx-auto w-full max-w-2xl text-center">
        <p className="font-mono text-sm uppercase tracking-widest text-[#E8185A]">Something went wrong</p>
        <h1 className="mt-4 font-display text-4xl text-[#1E2620] sm:text-5xl">We could not load this page</h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-[#5A6259]">
          An unexpected error occurred. You can try again, and if the problem continues, please come back later.
        </p>
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center rounded-full bg-[#1E2620] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#3F6B4F]"
          >
            Try again
          </button>
        </div>
      </div>
    </section>
  );
}
