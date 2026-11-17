"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { completeSsoSignIn } from "@/lib/api/auth";
import { roleHomePath } from "@/lib/auth/roleHome";

/** Only same-site paths. Anything else goes to the role's home page. */
function safeNext(value: string | null): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\") || value === "/") return null;
  return value;
}

/**
 * Where the API sends the browser after an AFS sign-in. The one-time code is exchanged once for a session, then the
 * person continues to the page they asked for, or to their role's home page.
 */
function CompleteForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState("");
  // The code works once. Development builds run effects twice, so only the first run may exchange it.
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const code = params?.get("code");
    if (!code) {
      setError("This sign-in link is incomplete. Sign in again.");
      return;
    }
    const next = safeNext(params?.get("next") ?? null);

    completeSsoSignIn(code)
      .then((res) => {
        const role = res.role || res.user?.role || "";
        router.replace(next ?? roleHomePath(role));
        router.refresh();
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Sign-in could not be completed.");
      });
  }, []);

  if (error) {
    return (
      <div className="min-h-screen grid place-items-center px-4 text-center">
        <div className="space-y-3">
          <p className="text-sm font-semibold text-rose-700">{error}</p>
          <Link href="/auth/login" className="text-sm font-bold underline">
            Back to sign-in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid place-items-center">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Signing you in with AFS…</span>
      </div>
    </div>
  );
}

export default function SsoCompletePage() {
  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center text-sm">Loading…</div>}>
      <CompleteForm />
    </Suspense>
  );
}
