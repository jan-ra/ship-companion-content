# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (Next.js)
npm run build    # Production build
npm run start    # Run production server
npm run lint     # Run ESLint
```

No test suite is configured.

## Architecture Overview

**Ship Companion Content Editor** — a client-side CMS for managing cruise ship content (ship info, maps, recipes, checklists, etc.) exported as `.appconf` ZIP archives.

### Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript 5**
- **Tailwind CSS 4** + **shadcn/ui** (style: "new-york") + **Radix UI**
- **Zustand 5** for state management
- **React Hook Form** + **Zod** for forms and validation
- **JSZip** + **file-saver** for `.appconf` import/export
- **React Leaflet** for maps
- No backend, no API routes — fully client-side

### File Format

Data is stored and exchanged as `.appconf` files (ZIP archives):
```
.appconf (ZIP):
├── app-data.json      # Main data structure
└── images/            # All referenced images as blobs
```

Import/export logic lives in [lib/json-utils.ts](lib/json-utils.ts).

### State Management (Zustand)

Two stores:

**`useAppDataStore`** ([lib/store.ts](lib/store.ts)):
- Holds `data: AppData | null`, `images: Map<string, Blob>`, `imageUrls: Map<string, string>`, `hasUnsavedChanges`
- `updateData(updater)` — all mutations go through this; triggers 500ms debounced auto-save to localStorage
- Images are stored separately in IndexedDB (via [lib/browser-storage.ts](lib/browser-storage.ts)); large blobs exceed localStorage limits
- Object URLs are created lazily and revoked on replacement to prevent memory leaks
- Image matching is extension-agnostic: `findImageByBaseName()` will match `photo.jpg` if `photo.png` is requested but not found

**`usePreferencesStore`** ([lib/preferences-store.ts](lib/preferences-store.ts)):
- Holds `devMode: boolean`, `uiLanguage: LanguageCode`
- Persisted to localStorage; detects browser language on first load
- Helper hooks: `useDevMode()`, `useUiLanguage()`

### Browser Storage

- **localStorage** (`ship-companion-data`): JSON app data
- **IndexedDB** (`ship-companion-images` / object store `images`): image blobs

On app load, `RestoreDataDialog` checks if browser storage has data and prompts the user to restore or discard it.

### Internationalization

Three languages: German (`de`), English (`en`), Dutch (`nl`).

- UI translations: [lib/i18n/](lib/i18n/) with locale files per language; accessed via `useT()` hook returning `t(key, values?)`
- Content data: all user-facing content fields use the pattern `translations: { de: T; en: T; nl: T }`
- `LanguageTabs` / `LanguageSelector` components allow editing each language variant

### Route Structure (App Router)

```
/app
├── page.tsx                        # Dashboard
├── layout.tsx                      # Root layout (sidebar, header, providers)
├── general/                        # General app settings
├── ship/
│   ├── about/                      # Ship description, facts, history, equipment
│   ├── checklists/
│   ├── contact/
│   ├── faq/
│   ├── links/
│   └── occupancy/                  # Cabin plan
├── maps/cities/
│   └── [id]/points/                # Points of interest per city
└── recipes/
    ├── recipes/[id]/               # Recipe editor
    └── cooking-schedule/
```

### Key Patterns

**Immutable updates:**
```typescript
updateData((current) => ({
  ...current,
  data: { ...current.data, field: newValue }
}))
```

**Form pattern:** React Hook Form + Zod schema + `useEffect` to sync store data into form on load.

**Icon system:** Material Icons SVG injected at runtime via `getIconSvg()` in [lib/material-icons.ts](lib/material-icons.ts); `MaterialIconSelector` component provides a picker dialog.

**Image uploads:** `ImageUploader` component handles file selection, converts to Blob, calls `addImage()` on the store. `getImageUrl()` returns a cached Object URL for rendering.
