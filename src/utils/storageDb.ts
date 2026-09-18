// IndexedDB helper for robust media and post draft persistence
// Prevents localStorage quota exceeded errors (5MB limit) when storing images

const DB_NAME = "FBPostDatabase";
const DB_VERSION = 1;
const STORE_MEDIA = "media_store";
const STORE_DRAFTS = "drafts_store";

export interface SavedDraft {
  id: string;
  title: string;
  rawContent: string;
  spintaxContent: string;
  images: string[];
  updatedAt: string;
  isAutoSaved?: boolean;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not supported"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result as IDBDatabase;
      if (!db.objectStoreNames.contains(STORE_MEDIA)) {
        db.createObjectStore(STORE_MEDIA, { keyPath: "key" });
      }
      if (!db.objectStoreNames.contains(STORE_DRAFTS)) {
        db.createObjectStore(STORE_DRAFTS, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Save active images to IndexedDB
export async function saveImagesToDB(images: string[]): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_MEDIA, "readwrite");
    const store = tx.objectStore(STORE_MEDIA);
    store.put({ key: "active_post_images", images, updatedAt: Date.now() });
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn("IndexedDB saveImagesToDB fallback to localStorage:", err);
    try {
      localStorage.setItem("fb_post_images", JSON.stringify(images));
    } catch (e) {
      console.warn("Storage quota exceeded in fallback", e);
    }
  }
}

// Load active images from IndexedDB (or fallback to localStorage)
export async function loadImagesFromDB(): Promise<string[] | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_MEDIA, "readonly");
    const store = tx.objectStore(STORE_MEDIA);
    const request = store.get("active_post_images");

    return new Promise((resolve) => {
      request.onsuccess = () => {
        if (request.result && Array.isArray(request.result.images)) {
          resolve(request.result.images);
        } else {
          // Check localStorage fallback
          const saved = localStorage.getItem("fb_post_images");
          if (saved) {
            try {
              resolve(JSON.parse(saved));
              return;
            } catch (e) {
              // ignore
            }
          }
          resolve(null);
        }
      };
      request.onerror = () => {
        const saved = localStorage.getItem("fb_post_images");
        if (saved) {
          try {
            resolve(JSON.parse(saved));
            return;
          } catch (e) {}
        }
        resolve(null);
      };
    });
  } catch (err) {
    const saved = localStorage.getItem("fb_post_images");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return null;
  }
}

// Save a draft to Drafts store
export async function saveDraftToDB(draft: SavedDraft): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_DRAFTS, "readwrite");
    const store = tx.objectStore(STORE_DRAFTS);
    store.put(draft);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn("saveDraftToDB error:", err);
  }
}

// Get all saved drafts
export async function getAllDraftsFromDB(): Promise<SavedDraft[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_DRAFTS, "readonly");
    const store = tx.objectStore(STORE_DRAFTS);
    const request = store.getAll();

    return new Promise((resolve) => {
      request.onsuccess = () => {
        const drafts = (request.result || []) as SavedDraft[];
        // Sort descending by updatedAt
        drafts.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        resolve(drafts);
      };
      request.onerror = () => resolve([]);
    });
  } catch (err) {
    console.warn("getAllDraftsFromDB error:", err);
    return [];
  }
}

// Delete a draft by ID
export async function deleteDraftFromDB(id: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_DRAFTS, "readwrite");
    const store = tx.objectStore(STORE_DRAFTS);
    store.delete(id);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn("deleteDraftFromDB error:", err);
  }
}
