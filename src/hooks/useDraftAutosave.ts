'use client';

import { useCallback, useEffect, useRef, useState } from "react";

export type DraftSaveState = "idle" | "pending" | "saving" | "saved" | "error";

export interface DraftSaveResult {
  ok: boolean;
  error?: string;
}

interface UseDraftAutosaveOptions {
  /** False until the draft has loaded, and after it has been submitted. */
  enabled: boolean;
  /** Changes whenever the content changes. Saving happens when it differs from the last saved one. */
  fingerprint: string;
  /** Persists the current content to the server. Should throw on failure. */
  save: () => Promise<void>;
  delayMs?: number;
  retryMs?: number;
}

/**
 * Saves a draft to the server shortly after the user stops typing.
 * Saves run one at a time, a failed save is retried, the browser warns before leaving
 * with unsaved changes, and pending changes are saved when the page is left in-app.
 */
export function useDraftAutosave({
  enabled,
  fingerprint,
  save,
  delayMs = 1500,
  retryMs = 10_000,
}: UseDraftAutosaveOptions) {
  const [state, setState] = useState<DraftSaveState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const saveRef = useRef(save);
  const latestRef = useRef(fingerprint);
  const savedRef = useRef<string | null>(null);
  const queueRef = useRef<Promise<DraftSaveResult>>(Promise.resolve({ ok: true }));
  const timerRef = useRef<number | null>(null);
  const savingRef = useRef(false);
  const enabledRef = useRef(enabled);

  saveRef.current = save;
  latestRef.current = fingerprint;
  enabledRef.current = enabled;

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const run = useCallback((): Promise<DraftSaveResult> => {
    clearTimer();
    queueRef.current = queueRef.current.then(async () => {
      const target = latestRef.current;
      if (!enabledRef.current || target === savedRef.current) return { ok: true };

      savingRef.current = true;
      setState("saving");
      try {
        await saveRef.current();
        savedRef.current = target;
        setError(null);
        setLastSavedAt(new Date());
        setState(latestRef.current === target ? "saved" : "pending");
        return { ok: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unexpected error while saving.";
        setError(message);
        setState("error");
        timerRef.current = window.setTimeout(() => void run(), retryMs);
        return { ok: false, error: message };
      } finally {
        savingRef.current = false;
      }
    });
    return queueRef.current;
  }, [retryMs]);

  // The content present when autosave is first enabled is what was just loaded, so it counts as saved.
  useEffect(() => {
    if (enabled && savedRef.current === null) savedRef.current = latestRef.current;
  }, [enabled]);

  // Debounced save after each change.
  useEffect(() => {
    if (!enabled || savedRef.current === null || fingerprint === savedRef.current) return;
    setState((current) => (current === "saving" ? current : "pending"));
    clearTimer();
    timerRef.current = window.setTimeout(() => void run(), delayMs);
    return clearTimer;
  }, [enabled, fingerprint, delayMs, run]);

  // Warn before closing or reloading the tab with unsaved changes.
  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      const dirty = savedRef.current !== null && latestRef.current !== savedRef.current;
      if (enabledRef.current && (dirty || savingRef.current)) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  // Leaving the page inside the app: save what is pending. The request finishes after navigation.
  useEffect(
    () => () => {
      clearTimer();
      if (enabledRef.current && savedRef.current !== null && latestRef.current !== savedRef.current) {
        void run();
      }
    },
    [run]
  );

  /** Saves now, after any save already running. Resolves { ok: false, error } when the save failed. */
  const flush = useCallback(() => run(), [run]);

  return { state, error, lastSavedAt, flush };
}
