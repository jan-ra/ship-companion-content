// Material Icons — runtime helpers.
// The icon list and groups are defined in icons.yaml and generated into
// lib/material-icons.generated.ts by running `npm run sync-icons`.

import { ICON_GROUPS, ALL_ICON_NAMES, ICON_ALIASES } from "./material-icons.generated";
export type { IconGroup } from "./material-icons.generated";
export { ICON_GROUPS, ALL_ICON_NAMES, ICON_ALIASES };

// Dynamic import of the iconify package
let iconData: any;
try {
  iconData = require("@iconify-json/material-symbols/icons.json");
} catch {
  iconData = { icons: {} };
}

// Convert from kebab-case (display) to snake_case (storage)
export function toSnakeCase(iconName: string): string {
  return iconName.replace(/-/g, "_");
}

// Convert from snake_case (stored in data) to kebab-case (display/lookup)
export function toKebabCase(iconName: string): string {
  return iconName.replace(/_/g, "-");
}

// Get SVG path for an icon (accepts either snake_case or kebab-case)
export function getIconSvg(iconName: string): string | null {
  const kebabName = toKebabCase(iconName);
  const lookupName = ICON_ALIASES[kebabName] ?? kebabName;

  let icon = (iconData.icons as any)[lookupName];
  if (!icon) icon = (iconData.icons as any)[`${lookupName}-rounded`];
  if (!icon) icon = (iconData.icons as any)[`${lookupName}-outline`];

  return icon?.body ?? null;
}

// Flat sorted list of all icon names in kebab-case (for backward compat / search)
export const MATERIAL_ICONS: string[] = ALL_ICON_NAMES
  .map((name) => name.replace(/_/g, "-"))
  .sort();
