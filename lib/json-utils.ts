import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import type { AppData } from './types';

/**
 * Import JSON file and parse it as AppData
 */
export async function importJsonFile(file: File): Promise<AppData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const data = JSON.parse(text) as AppData;

        // Basic validation
        if (!data.data || !data.version || !data.shipName) {
          throw new Error('Invalid app-data.json structure');
        }

        resolve(data);
      } catch (error) {
        reject(new Error('Failed to parse JSON file: ' + (error as Error).message));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}

/**
 * Export AppData as JSON file
 */
export function exportJsonFile(data: AppData, filename = 'app-data.json'): void {
  // Update export date
  const exportData: AppData = {
    ...data,
    exportDate: new Date().toISOString(),
  };

  // Convert to JSON with indentation
  const jsonString = JSON.stringify(exportData, null, 2);

  // Create blob and trigger download
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
  saveAs(blob, filename);
}

/**
 * Validate JSON structure (basic validation)
 */
export function validateAppData(data: unknown): data is AppData {
  if (typeof data !== 'object' || data === null) return false;

  const appData = data as Partial<AppData>;

  return !!(
    appData.exportDate &&
    appData.version &&
    appData.shipName &&
    appData.data &&
    typeof appData.data === 'object' &&
    Array.isArray(appData.data.recipes) &&
    Array.isArray(appData.data.points) &&
    Array.isArray(appData.data.cities) &&
    Array.isArray(appData.data.checklists) &&
    Array.isArray(appData.data.cabins) &&
    Array.isArray(appData.data.questions) &&
    appData.data.links &&
    appData.data.about
  );
}

/**
 * Generate unique ID for items
 */
export function generateId(prefix = ''): string {
  return `${prefix}${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate unique numeric ID
 */
export function generateNumericId(existingIds: number[]): number {
  if (existingIds.length === 0) return 1;
  return Math.max(...existingIds) + 1;
}

/**
 * Import .appconf file (ZIP containing app-data.json and images)
 */
export async function importAppConfFile(file: File): Promise<{ data: AppData; images: Map<string, Blob> }> {
  try {
    const zip = await JSZip.loadAsync(file);

    // Extract app-data.json
    const appDataFile = zip.file('app-data.json');
    if (!appDataFile) {
      throw new Error('app-data.json not found in .appconf file');
    }

    const jsonText = await appDataFile.async('text');
    const data = JSON.parse(jsonText) as AppData;

    // Basic validation
    if (!data.data || !data.version || !data.shipName) {
      throw new Error('Invalid app-data.json structure');
    }

    // Extract images from images/ folder
    const images = new Map<string, Blob>();
    const imagesFolder = zip.folder('images');

    if (imagesFolder) {
      const imageFiles = Object.keys(zip.files).filter((path) => path.startsWith('images/') && !path.endsWith('/'));

      for (const path of imageFiles) {
        const file = zip.file(path);
        if (file) {
          const filename = path.replace('images/', '');
          const blob = await file.async('blob');
          images.set(filename, blob);
        }
      }
    }

    return { data, images };
  } catch (error) {
    throw new Error('Failed to import .appconf file: ' + (error as Error).message);
  }
}

/**
 * Export AppData as .appconf file (ZIP with app-data.json and images)
 */
export async function exportAppConfFile(data: AppData, images: Map<string, Blob>): Promise<void> {
  try {
    const zip = new JSZip();

    // Update export date
    const exportData: AppData = {
      ...data,
      exportDate: new Date().toISOString(),
    };

    // Add app-data.json to ZIP
    const jsonString = JSON.stringify(exportData, null, 2);
    zip.file('app-data.json', jsonString);

    // Create images folder and add images
    const imagesFolder = zip.folder('images');
    if (imagesFolder) {
      images.forEach((blob, filename) => {
        imagesFolder.file(filename, blob);
      });
    }

    // Generate ZIP blob
    const zipBlob = await zip.generateAsync({ type: 'blob' });

    // Generate filename: shipname-MMHHDDMMYYYY.appconf
    const now = new Date();
    const mm = String(now.getMinutes()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const mo = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    const timestamp = `${mm}${hh}${dd}${mo}${yyyy}`;
    const shipSlug = data.shipName.toLowerCase().replace(/\s+/g, '-');
    const filename = `${shipSlug}-${timestamp}.appconf`;

    // Trigger download
    saveAs(zipBlob, filename);
  } catch (error) {
    throw new Error('Failed to export .appconf file: ' + (error as Error).message);
  }
}
