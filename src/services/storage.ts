import type { Property } from "@/types";
import { STORAGE_KEYS } from "@/constants";

export function saveProperties(properties: Property[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(properties));
  } catch (e) {
    console.error("Failed to save properties:", e);
  }
}

export function loadProperties(): Property[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROPERTIES);
    if (!raw) return [];
    return JSON.parse(raw) as Property[];
  } catch {
    return [];
  }
}

export function clearStorage(): void {
  localStorage.removeItem(STORAGE_KEYS.PROPERTIES);
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);
}

// IndexedDB wrapper for larger datasets (future migration point)
export async function savePropertiesToIDB(properties: Property[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("sekisan_db", 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("properties")) {
        db.createObjectStore("properties", { keyPath: "id" });
      }
    };
    req.onsuccess = () => {
      const db = req.result;
      const tx = db.transaction("properties", "readwrite");
      const store = tx.objectStore("properties");
      properties.forEach((p) => store.put(p));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    };
    req.onerror = () => reject(req.error);
  });
}
