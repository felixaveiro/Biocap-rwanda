// One-time migration of story drafts that older versions of the editor kept in the browser
// (IndexedDB "biocap-creator-drafts", and before that localStorage). Drafts are now saved on the server,
// so a copy found here is moved there once and then deleted. Copies expired after 5 hours, so this
// module can be removed once every writer has opened the editor after the release.

import { BlogBlock } from "@/types";

export interface LegacyStoryDraft {
  title: string;
  tag: string;
  excerpt: string;
  blocks: BlogBlock[];
  coverImage: string; // data URL or hosted URL
  socialHandle: string;
  organizationLink: string;
  expiresAt: number;
  serverDraftId?: string;
}

const DATABASE_NAME = "biocap-creator-drafts";
const STORE_NAME = "story-drafts";
const LEGACY_TTL_MS = 5 * 60 * 60 * 1000;

const storageKey = (userId: string) => `biocap-story-draft:${userId}`;

// Resolves null when IndexedDB is unavailable or the database was never created.
const withStore = async <T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest | void
): Promise<T | null> => {
  if (typeof window === "undefined" || !window.indexedDB) return null;

  const database = await new Promise<IDBDatabase | null>((resolve, reject) => {
    const request = window.indexedDB.open(DATABASE_NAME);
    // The database does not exist yet: nothing to migrate, so do not create it.
    request.onupgradeneeded = () => request.transaction?.abort();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => (request.error?.name === "AbortError" ? resolve(null) : reject(request.error));
  });
  if (!database) return null;

  try {
    if (!database.objectStoreNames.contains(STORE_NAME)) return null;
    return await new Promise<T | null>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, mode);
      const request = action(transaction.objectStore(STORE_NAME));
      transaction.oncomplete = () => resolve(request ? ((request.result as T | undefined) ?? null) : null);
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally {
    database.close();
  }
};

/** Returns the browser copy of the user's draft, or null when there is none or it has expired. */
export async function readLegacyStoryDraft(userId: string): Promise<LegacyStoryDraft | null> {
  const key = storageKey(userId);
  let draft = await withStore<LegacyStoryDraft>("readonly", (store) => store.get(key));

  if (!draft) {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw) as Omit<LegacyStoryDraft, "expiresAt"> & { expiresAt?: number };
        draft = { ...parsed, expiresAt: typeof parsed.expiresAt === "number" ? parsed.expiresAt : Date.now() + LEGACY_TTL_MS };
      }
    } catch {
      draft = null;
    }
  }

  if (!draft) return null;
  if (draft.expiresAt <= Date.now()) {
    await clearLegacyStoryDraft(userId);
    return null;
  }
  return draft;
}

/** Deletes the browser copy of the user's draft from both old storage locations. */
export async function clearLegacyStoryDraft(userId: string): Promise<void> {
  const key = storageKey(userId);
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Storage blocked: nothing stored there either.
  }
  await withStore("readwrite", (store) => {
    store.delete(key);
  });
}
