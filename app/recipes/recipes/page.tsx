"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDataStore } from "@/lib/store";
import { generateId } from "@/lib/json-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, UtensilsCrossed, Search, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import type { Recipe } from "@/lib/types";

const RECIPE_TYPES = [
  { value: "omni", label: "Omnivore" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
];

export default function RecipesPage() {
  const router = useRouter();
  const { data, updateData } = useAppDataStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

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

    toast.success("New recipe added");
    router.push(`/recipes/recipes/${newId}`);
  };

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Recipes</h1>
            <p className="text-muted-foreground">
              Manage recipes, ingredients, and cooking instructions · {recipes.length} recipes
            </p>
          </div>
          <Button onClick={addRecipe} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Recipe
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">All Recipes</CardTitle>
        </CardHeader>
        <CardContent>
          {recipes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <UtensilsCrossed className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p>No recipes yet</p>
              <Button onClick={addRecipe} variant="outline" className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Add First Recipe
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search recipes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
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
                    <p>No recipes match your search</p>
                  </div>
                ) : (
                  filteredRecipes.map((recipe) => (
                    <button
                      key={recipe.id}
                      onClick={() => router.push(`/recipes/recipes/${recipe.id}`)}
                      className="w-full flex items-center gap-3 p-4 rounded-lg border-2 border-border text-left transition-all hover:bg-accent/50 hover:border-accent"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">
                            {recipe.translations.en.title || `Recipe #${recipe.id.slice(-6)}`}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {getRecipeTypeLabel(recipe.type)} · {recipe.ingredients.length} ingredients
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </button>
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
