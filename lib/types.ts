// TypeScript types generated from app-data-schema.json

export type LanguageCode = "de" | "en" | "nl";

export type Translations<T> = {
  de: T;
  en: T;
  nl: T;
};

// Recipe types
export interface Recipe {
  id: string;
  type: string;
  ingredients: Ingredient[];
  spices: {
    de: string[];
    en: string[];
    nl: string[];
  };
  translations: Translations<RecipeTranslation>;
  isFavorite?: boolean;
}

export interface RecipeTranslation {
  title: string;
  description: string;
  instructions: string[];
}

export interface Ingredient {
  id: string;
  amount: number | null;
  translations: Translations<IngredientTranslation>;
}

export interface IngredientTranslation {
  name: string;
  unit: string;
}

// Map types
export type PointType = "port" | "shop" | "food" | "attraction" | "beach" | "trash" | "shower";

export interface InterestPoint {
  id: number;
  latitude: number;
  longitude: number;
  displayLatitude?: number;
  displayLongitude?: number;
  type: PointType;
  cityId: number;
  translations: Translations<LocationTranslation>;
}

export interface City {
  id: number;
  latitude: number;
  longitude: number;
  displayLatitude?: number;
  displayLongitude?: number;
  zoomLevel: number;
  isIsland: "yes" | "no";
  translations: Translations<LocationTranslation>;
}

export interface LocationTranslation {
  name: string;
  description: string;
}

// Checklist types
export interface ChecklistCategory {
  id: string;
  icon: string;
  tasks: CheckItem[];
  translations: Translations<ChecklistCategoryTranslation>;
}

export interface ChecklistCategoryTranslation {
  title: string;
  description: string;
}

export interface CheckItem {
  id: string;
  translations: Translations<CheckItemTranslation>;
}

export interface CheckItemTranslation {
  title: string;
  description: string;
  image?: string;
}

// Cabin types
export interface Cabin {
  cabinNr: number;
  posTop: number;
  posLeft: number;
  beds: number;
  occupants?: string[];
  translations?: Translations<CabinTranslation>;
}

export interface CabinTranslation {
  comment?: string;
}

// Links types
export interface Links {
  phone: string;
  mail: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
  links: {
    booking: string;
    supplies?: SupplyLink[];
    privacy: string;
    shipLocation?: string;
    additional?: AdditionalLink[];
  };
  translations: Translations<LinksTranslation>;
}

export interface SupplyLink {
  url: string;
  translations: Translations<SupplyLinkTranslation>;
}

export interface SupplyLinkTranslation {
  name: string;
  description: string;
}

export interface AdditionalLink {
  id: string;
  url: string;
  translations: Translations<AdditionalLinkTranslation>;
}

export interface AdditionalLinkTranslation {
  name: string;
  description: string;
}

export interface LinksTranslation {
  companyName: string;
  skipperName: string;
  claim: string;
  supplyExplanation?: string;
}

// About types
export interface About {
  translations: Translations<AboutTranslation>;
  facts: Fact[];
  history?: HistoryStep[];
  equipment?: Equipment[];
  impressions?: string[];
}

export interface AboutTranslation {
  vita: string;
  captainImage: string;
  description: string;
}

export interface Fact {
  icon: string;
  translations: Translations<FactTranslation>;
}

export interface FactTranslation {
  key: string;
  value: string;
}

export interface HistoryStep {
  translations: Translations<HistoryStepTranslation>;
}

export interface HistoryStepTranslation {
  heading?: string;
  text?: string;
}

export interface Equipment {
  icon: string;
  translations: Translations<EquipmentTranslation>;
}

export interface EquipmentTranslation {
  name: string;
  description: string;
}

// FAQ types
export interface Question {
  id?: string;
  translations: Translations<QuestionTranslation>;
}

export interface QuestionTranslation {
  questiontext: string;
  answertext: string;
  answerImage?: string;
}

// Main data structure
export interface AppData {
  exportDate: string;
  version: string;
  shipName: string;
  appconf_folder_id?: string;
  data: {
    recipes: Recipe[];
    points: InterestPoint[];
    cities: City[];
    checklists: ChecklistCategory[];
    cabins: Cabin[];
    links: Links;
    about: About;
    questions: Question[];
  };
}
