import type { AppData } from './types';

const STORAGE_KEY = 'ship-companion-data';
const STORAGE_TIMESTAMP_KEY = 'ship-companion-data-timestamp';
const IMAGES_DB_NAME = 'ship-companion-images';
const IMAGES_STORE_NAME = 'images';
const DB_VERSION = 1;

/**
 * Save app data to localStorage
 */
export function saveDataToStorage(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    localStorage.setItem(STORAGE_TIMESTAMP_KEY, new Date().toISOString());
  } catch (error) {
    console.error('Failed to save data to localStorage:', error);
  }
}

/**
 * Load app data from localStorage
 */
export function loadDataFromStorage(): AppData | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as AppData;
    }
  } catch (error) {
    console.error('Failed to load data from localStorage:', error);
  }
  return null;
}

/**
 * Check if data exists in localStorage
 */
export function hasDataInStorage(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null;
}

/**
 * Clear app data from localStorage
 */
export function clearDataFromStorage(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_TIMESTAMP_KEY);
}

/**
 * Get the last modified timestamp from stored data
 */
export function getStorageTimestamp(): Date | null {
  try {
    const timestamp = localStorage.getItem(STORAGE_TIMESTAMP_KEY);
    if (timestamp) {
      return new Date(timestamp);
    }
  } catch (error) {
    console.error('Failed to get storage timestamp:', error);
  }
  return null;
}

// IndexedDB operations for images

/**
 * Open the IndexedDB database for images
 */
function openImagesDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(IMAGES_DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(IMAGES_STORE_NAME)) {
        db.createObjectStore(IMAGES_STORE_NAME);
      }
    };
  });
}

/**
 * Save a single image to IndexedDB
 */
export async function saveImageToStorage(filename: string, blob: Blob): Promise<void> {
  try {
    const db = await openImagesDB();
    const transaction = db.transaction(IMAGES_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(IMAGES_STORE_NAME);

    // Convert Blob to ArrayBuffer for storage
    const arrayBuffer = await blob.arrayBuffer();

    await new Promise<void>((resolve, reject) => {
      const request = store.put({ data: arrayBuffer, type: blob.type }, filename);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });

    db.close();
  } catch (error) {
    console.error('Failed to save image to IndexedDB:', error);
  }
}

/**
 * Save all images to IndexedDB
 */
export async function saveAllImagesToStorage(images: Map<string, Blob>): Promise<void> {
  try {
    const db = await openImagesDB();
    const transaction = db.transaction(IMAGES_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(IMAGES_STORE_NAME);

    // Clear existing images
    await new Promise<void>((resolve, reject) => {
      const clearRequest = store.clear();
      clearRequest.onerror = () => reject(clearRequest.error);
      clearRequest.onsuccess = () => resolve();
    });

    // Add all images
    for (const [filename, blob] of images.entries()) {
      const arrayBuffer = await blob.arrayBuffer();
      store.put({ data: arrayBuffer, type: blob.type }, filename);
    }

    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });

    db.close();
  } catch (error) {
    console.error('Failed to save images to IndexedDB:', error);
  }
}

/**
 * Load all images from IndexedDB
 */
export async function loadImagesFromStorage(): Promise<Map<string, Blob>> {
  const images = new Map<string, Blob>();

  try {
    const db = await openImagesDB();
    const transaction = db.transaction(IMAGES_STORE_NAME, 'readonly');
    const store = transaction.objectStore(IMAGES_STORE_NAME);

    await new Promise<void>((resolve, reject) => {
      const request = store.openCursor();

      request.onerror = () => reject(request.error);
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const { data, type } = cursor.value;
          const blob = new Blob([data], { type });
          images.set(cursor.key as string, blob);
          cursor.continue();
        } else {
          resolve();
        }
      };
    });

    db.close();
  } catch (error) {
    console.error('Failed to load images from IndexedDB:', error);
  }

  return images;
}

/**
 * Check if images exist in IndexedDB
 */
export async function hasImagesInStorage(): Promise<boolean> {
  try {
    const db = await openImagesDB();
    const transaction = db.transaction(IMAGES_STORE_NAME, 'readonly');
    const store = transaction.objectStore(IMAGES_STORE_NAME);

    const count = await new Promise<number>((resolve, reject) => {
      const request = store.count();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });

    db.close();
    return count > 0;
  } catch (error) {
    console.error('Failed to check images in IndexedDB:', error);
    return false;
  }
}

/**
 * Clear all images from IndexedDB
 */
export async function clearImagesFromStorage(): Promise<void> {
  try {
    const db = await openImagesDB();
    const transaction = db.transaction(IMAGES_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(IMAGES_STORE_NAME);

    await new Promise<void>((resolve, reject) => {
      const request = store.clear();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });

    db.close();
  } catch (error) {
    console.error('Failed to clear images from IndexedDB:', error);
  }
}

/**
 * Remove a single image from IndexedDB
 */
export async function removeImageFromStorage(filename: string): Promise<void> {
  try {
    const db = await openImagesDB();
    const transaction = db.transaction(IMAGES_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(IMAGES_STORE_NAME);

    await new Promise<void>((resolve, reject) => {
      const request = store.delete(filename);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });

    db.close();
  } catch (error) {
    console.error('Failed to remove image from IndexedDB:', error);
  }
}

/**
 * Clear all stored data (both localStorage and IndexedDB)
 */
export async function clearAllStorage(): Promise<void> {
  clearDataFromStorage();
  await clearImagesFromStorage();
}
