// Material Icons list from @iconify-json/material-symbols
// This ensures we only use officially available Material Design icons

// Dynamic import to avoid build issues
let iconData: any;
try {
  iconData = require("@iconify-json/material-symbols/icons.json");
} catch {
  // Fallback for edge cases
  iconData = { icons: {} };
}

// Allowed icon names matching the Flutter app's _iconMap keys exactly.
// These keys are stored in snake_case in app-data.json.
export const ALLOWED_ICON_NAMES = [
  // Home & places
  "home", "place", "location_on", "location_off", "map", "my_location",
  "explore", "directions", "flag", "anchor",

  // People & social
  "people", "group",

  // Media
  "photo_camera", "video_camera_back", "music_note",

  // Equipment & household
  "kitchen", "shower", "bathtub", "wc", "coffee", "sports_bar", "microwave",
  "local_fire_department", "ac_unit", "wifi", "speaker", "outdoor_grill",
  "safety_check", "medical_services", "thermostat", "air",
  "local_laundry_service", "dry_cleaning", "bed", "hotel", "weekend",
  "chair", "desk", "light", "lightbulb", "power", "electrical_services",

  // Weather & nature
  "wb_sunny", "wb_cloudy", "water", "water_drop", "waves", "sailing",
  "cloud", "thunderstorm", "beach_access", "yard",

  // Time & calendar
  "event", "alarm", "timer",

  // Measurements & tools
  "straighten", "open_in_full", "width_normal", "height", "speed", "scale",
  "square_foot", "compress",

  // Food & dining
  "restaurant", "local_dining", "lunch_dining", "dinner_dining",
  "breakfast_dining", "local_pizza", "local_cafe", "local_bar", "cake", "icecream",

  // Shopping & business
  "shopping_cart", "shopping_bag", "store", "local_grocery_store",

  // Technology
  "computer", "phone_iphone", "tablet", "watch", "tv", "headphones",
  "bluetooth", "usb", "battery_full", "battery_charging_full",
  "signal_wifi_4_bar", "signal_cellular_4_bar",

  // Sports & recreation
  "fitness_center", "pool", "sports", "sports_soccer", "sports_basketball",
  "sports_tennis", "golf_course", "hiking", "kayaking",

  // Health & safety
  "favorite", "favorite_border", "local_hospital", "health_and_safety",
  "masks", "sanitizer", "vaccines",

  // Miscellaneous
  "star", "star_border", "star_half", "bookmark", "bookmark_border", "label",
  "local_offer", "emoji_events", "emoji_emotions", "thumb_up", "thumb_down",
  "visibility", "visibility_off", "lock", "lock_open", "vpn_key",
  "admin_panel_settings", "build", "construction", "handyman", "bug_report",
  "feedback", "grade", "verified", "verified_user", "security", "language",
  "translate", "public", "pets", "child_friendly", "smoking_rooms", "smoke_free",
];

// Mapping for Flutter icon names that differ in the material-symbols iconify package.
// Key: kebab-case Flutter name, Value: iconify material-symbols name that renders the same icon.
const ICON_ALIASES: Record<string, string> = {
  "place": "location-on",
  "people": "group",
  "power": "power-settings-new",
  "wb-cloudy": "cloud",
  "local-grocery-store": "storefront",
  "favorite-border": "favorite",
  "star-border": "star-outline",
  "bookmark-border": "bookmark",
  "local-offer": "sell",
  "emoji-events": "trophy",
  "emoji-emotions": "mood",
};

// Get all icon names from the official package that are in our allowed list
export const MATERIAL_ICONS = ALLOWED_ICON_NAMES
  .map(name => name.replace(/_/g, "-")) // Convert to kebab-case for lookup
  .filter(kebabName => {
    const lookupName = ICON_ALIASES[kebabName] || kebabName;
    // Check if the icon exists in the package (base, rounded, or outline variant)
    return (
      iconData.icons[lookupName] !== undefined ||
      iconData.icons[`${lookupName}-rounded`] !== undefined ||
      iconData.icons[`${lookupName}-outline`] !== undefined
    );
  })
  .sort();

// Convert from kebab-case (used in display) to snake_case (used in storage)
export function toSnakeCase(iconName: string): string {
  return iconName.replace(/-/g, "_");
}

// Convert from snake_case (stored in data) to kebab-case (used for display)
export function toKebabCase(iconName: string): string {
  return iconName.replace(/_/g, "-");
}

// Get SVG path for an icon
export function getIconSvg(iconName: string): string | null {
  const kebabName = toKebabCase(iconName);
  const lookupName = ICON_ALIASES[kebabName] || kebabName;

  // Try to get the base icon first
  let icon = (iconData.icons as any)[lookupName];

  // If not found, try the rounded variant (some icons only exist as variants)
  if (!icon) {
    icon = (iconData.icons as any)[`${lookupName}-rounded`];
  }

  // If still not found, try outline variant
  if (!icon) {
    icon = (iconData.icons as any)[`${lookupName}-outline`];
  }

  return icon?.body || null;
}
