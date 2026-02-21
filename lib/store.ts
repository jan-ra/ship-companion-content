import { create } from 'zustand';
import type { AppData } from './types';
import {
  saveDataToStorage,
  saveImageToStorage,
  removeImageFromStorage,
  saveAllImagesToStorage,
  clearAllStorage,
} from './browser-storage';

// Debounce helper for auto-saving
let saveTimeout: ReturnType<typeof setTimeout> | null = null;
const SAVE_DEBOUNCE_MS = 500;

function debouncedSaveData(data: AppData) {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  saveTimeout = setTimeout(() => {
    saveDataToStorage(data);
  }, SAVE_DEBOUNCE_MS);
}

/**
 * Get the base filename without extension
 */
function getBaseName(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  return lastDot > 0 ? filename.substring(0, lastDot) : filename;
}

/**
 * Find an image by base name (extension-agnostic matching)
 */
function findImageByBaseName(images: Map<string, Blob>, filename: string): { key: string; blob: Blob } | null {
  const baseName = getBaseName(filename);

  // First try exact match
  if (images.has(filename)) {
    return { key: filename, blob: images.get(filename)! };
  }

  // Then try matching by base name
  for (const [key, blob] of images.entries()) {
    if (getBaseName(key) === baseName) {
      return { key, blob };
    }
  }

  return null;
}

/**
 * Normalize spice arrays: split comma-separated strings into individual entries.
 * The source data may store spices as ["Pepper, Salt"] instead of ["Pepper", "Salt"].
 */
function normalizeSpices(data: AppData): AppData {
  const needsNormalization = data.data.recipes.some((r) =>
    Object.values(r.spices).some((arr) =>
      arr.some((s) => s.includes(','))
    )
  );

  if (!needsNormalization) return data;

  return {
    ...data,
    data: {
      ...data.data,
      recipes: data.data.recipes.map((r) => ({
        ...r,
        spices: {
          de: r.spices.de.flatMap((s) => s.split(',').map((x) => x.trim()).filter(Boolean)),
          en: r.spices.en.flatMap((s) => s.split(',').map((x) => x.trim()).filter(Boolean)),
          nl: r.spices.nl.flatMap((s) => s.split(',').map((x) => x.trim()).filter(Boolean)),
        },
      })),
    },
  };
}

interface AppDataStore {
  data: AppData | null;
  images: Map<string, Blob>;
  imageUrls: Map<string, string>; // Cache for object URLs
  hasUnsavedChanges: boolean;

  // Actions
  setData: (data: AppData, images?: Map<string, Blob>) => void;
  updateData: (updater: (data: AppData) => AppData) => void;
  clearData: () => void;
  markSaved: () => void;

  // Image actions
  addImage: (filename: string, blob: Blob) => void;
  removeImage: (filename: string) => void;
  getImageUrl: (filename: string) => string | null;
  hasImage: (filename: string) => boolean;
}

export const useAppDataStore = create<AppDataStore>((set, get) => ({
  data: null,
  images: new Map(),
  imageUrls: new Map(),
  hasUnsavedChanges: false,

  setData: (data, images = new Map()) => {
    // Clean up old object URLs
    const state = get();
    state.imageUrls.forEach((url) => URL.revokeObjectURL(url));

    // Normalize data on import
    const normalized = normalizeSpices(data);

    set({
      data: normalized,
      images,
      imageUrls: new Map(),
      hasUnsavedChanges: false
    });

    // Save to browser storage
    saveDataToStorage(normalized);
    saveAllImagesToStorage(images);
  },

  updateData: (updater) => set((state) => {
    if (!state.data) return state;
    const newData = updater(state.data);

    // Auto-save to browser storage (debounced)
    debouncedSaveData(newData);

    return {
      data: newData,
      hasUnsavedChanges: true,
    };
  }),

  clearData: () => {
    const state = get();
    // Clean up object URLs
    state.imageUrls.forEach((url) => URL.revokeObjectURL(url));

    set({
      data: null,
      images: new Map(),
      imageUrls: new Map(),
      hasUnsavedChanges: false
    });

    // Clear browser storage
    clearAllStorage();
  },

  markSaved: () => set({ hasUnsavedChanges: false }),

  addImage: (filename, blob) => set((state) => {
    const newImages = new Map(state.images);
    newImages.set(filename, blob);

    // Revoke old URL if exists
    const oldUrl = state.imageUrls.get(filename);
    if (oldUrl) {
      URL.revokeObjectURL(oldUrl);
    }

    // Create new URL
    const newUrl = URL.createObjectURL(blob);
    const newImageUrls = new Map(state.imageUrls);
    newImageUrls.set(filename, newUrl);

    // Save image to browser storage
    saveImageToStorage(filename, blob);

    return {
      images: newImages,
      imageUrls: newImageUrls,
      hasUnsavedChanges: true,
    };
  }),

  removeImage: (filename) => set((state) => {
    const newImages = new Map(state.images);
    const newImageUrls = new Map(state.imageUrls);

    // Find and remove the image by base name (extension-agnostic)
    const match = findImageByBaseName(state.images, filename);
    if (match) {
      newImages.delete(match.key);

      // Revoke URL for the matched key
      const url = state.imageUrls.get(match.key);
      if (url) {
        URL.revokeObjectURL(url);
      }
      newImageUrls.delete(match.key);

      // Remove from browser storage
      removeImageFromStorage(match.key);
    }

    // Also clean up any cached URL for the requested filename
    if (filename !== match?.key && state.imageUrls.has(filename)) {
      const url = state.imageUrls.get(filename);
      if (url) {
        URL.revokeObjectURL(url);
      }
      newImageUrls.delete(filename);
    }

    return {
      images: newImages,
      imageUrls: newImageUrls,
      hasUnsavedChanges: true,
    };
  }),

  getImageUrl: (filename) => {
    const state = get();

    // Return cached URL if exists (check both exact and base name)
    if (state.imageUrls.has(filename)) {
      return state.imageUrls.get(filename)!;
    }

    // Try to find image by base name (extension-agnostic)
    const match = findImageByBaseName(state.images, filename);
    if (match) {
      // Check if we already have a cached URL for the matched key
      if (state.imageUrls.has(match.key)) {
        return state.imageUrls.get(match.key)!;
      }

      // Create new URL
      const url = URL.createObjectURL(match.blob);
      set((s) => {
        const newImageUrls = new Map(s.imageUrls);
        newImageUrls.set(match.key, url);
        // Also cache for the requested filename for faster future lookups
        if (match.key !== filename) {
          newImageUrls.set(filename, url);
        }
        return { imageUrls: newImageUrls };
      });
      return url;
    }

    return null;
  },

  hasImage: (filename) => {
    return findImageByBaseName(get().images, filename) !== null;
  },
}));
