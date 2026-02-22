"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDataStore } from "@/lib/store";
import { generateId } from "@/lib/json-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, UtensilsCrossed, Search, ChevronRight, Trash2, Info } from "lucide-react";
import { toast } from "sonner";
import type { Recipe } from "@/lib/types";
import { useT } from "@/lib/i18n";
import { useUiLanguage } from "@/lib/preferences-store";

export default function RecipesPage() {
  const router = useRouter();
  const { data, updateData } = useAppDataStore();
  const { t } = useT();
  const uiLanguage = useUiLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const RECIPE_TYPES = [
    { value: "omni", label: t("recipes.typeOmni") },
    { value: "vegetarian", label: t("recipes.typeVegetarian") },
    { value: "vegan", label: t("recipes.typeVegan") },
  ];

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No data loaded</p>
      </div>
    );
  }

  const recipes = data.data.recipes;

  const getRecipeTypeLabel = (type: string) => {
    return RECIPE_TYPES.find((t) => t.value === type)?.label || type;
  };

  // Filter recipes based on search query and type filter
  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch = !searchQuery.trim() || (
      recipe.translations.en.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.translations.de.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.translations.nl.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const matchesType = filterType === "all" || recipe.type === filterType;
    return matchesSearch && matchesType;
  });

  const addRecipe = () => {
    const newId = generateId("recipe-");
    const newRecipe: Recipe = {
      id: newId,
      type: "omni",
      ingredients: [],
      spices: {
        de: [],
        en: [],
        nl: [],
      },
      translations: {
        de: { title: "", description: "", instructions: [] },
        en: { title: "", description: "", instructions: [] },
        nl: { title: "", description: "", instructions: [] },
      },
    };

    updateData((d) => ({
      ...d,
      data: {
        ...d.data,
        recipes: [...d.data.recipes, newRecipe],
      },
    }));

    toast.success(t("recipes.toastAdded"));
    router.push(`/recipes/recipes/${newId}`);
  };

  const deleteRecipe = (id: string) => {
    if (!confirm(t("recipes.deleteRecipeConfirm"))) return;
    updateData((d) => ({
      ...d,
      data: {
        ...d.data,
        recipes: d.data.recipes.filter((r) => r.id !== id),
      },
    }));
    toast.success(t("recipes.toastDeleted"));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t("recipes.title")}</h1>
            <p className="text-muted-foreground">
              {t("recipes.subtitle", { count: recipes.length })}
            </p>
          </div>
          <Button onClick={addRecipe} className="gap-2">
            <Plus className="h-4 w-4" />
            {t("recipes.addRecipe")}
          </Button>
        </div>
      </div>

      <Alert className="mb-6 bg-yellow-50 border-yellow-200">
        <Info className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="text-yellow-800">{t("recipes.infoTitle")}</AlertTitle>
        <AlertDescription className="text-yellow-700">{t("recipes.infoText")}</AlertDescription>
      </Alert>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t("recipes.allRecipes")}</CardTitle>
        </CardHeader>
        <CardContent>
          {recipes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <UtensilsCrossed className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p>{t("recipes.noRecipes")}</p>
              <Button onClick={addRecipe} variant="outline" className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                {t("recipes.addFirstRecipe")}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("recipes.searchPlaceholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={t("recipes.filterByType")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("recipes.allTypes")}</SelectItem>
                    {RECIPE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                {filteredRecipes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>{t("recipes.noSearchResults")}</p>
                  </div>
                ) : (
                  filteredRecipes.map((recipe) => (
                    <div
                      key={recipe.id}
                      className="w-full flex items-center gap-3 p-4 rounded-lg border-2 border-border transition-all hover:bg-accent/50 hover:border-accent"
                    >
                      <button
                        onClick={() => router.push(`/recipes/recipes/${recipe.id}`)}
                        className="flex-1 min-w-0 text-left"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">
                            {recipe.translations[uiLanguage].title || recipe.translations.en.title || t("recipes.recipeFallback", { id: recipe.id.slice(-6) })}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {getRecipeTypeLabel(recipe.type)} · {t("recipes.recipeIngredients", { count: recipe.ingredients.length })}
                        </div>
                      </button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => deleteRecipe(recipe.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
