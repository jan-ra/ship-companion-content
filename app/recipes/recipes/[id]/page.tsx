"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDataStore } from "@/lib/store";
import { generateId } from "@/lib/json-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MultiLanguageInput } from "@/components/multi-language-input";
import { MultiLanguageTextarea } from "@/components/multi-language-textarea";
import { LanguageSelector } from "@/components/language-selector";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Plus, Trash2, X, Info } from "lucide-react";
import { toast } from "sonner";
import type { LanguageCode, Ingredient } from "@/lib/types";

const RECIPE_TYPES = [
  { value: "omni", label: "Omnivore" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
];


export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const recipeId = params.id as string;

  const { data, updateData } = useAppDataStore();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>("en");

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No data loaded</p>
      </div>
    );
  }

  const recipe = data.data.recipes.find((r) => r.id === recipeId);

  if (!recipe) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={() => router.push("/recipes/recipes")} className="gap-2 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Recipes
        </Button>
        <p className="text-muted-foreground">Recipe not found</p>
      </div>
    );
  }

  const updateRecipe = (updates: Partial<typeof recipe>) => {
    updateData((d) => ({
      ...d,
      data: {
        ...d.data,
        recipes: d.data.recipes.map((r) => (r.id === recipeId ? { ...r, ...updates } : r)),
      },
    }));
  };

  const updateRecipeTranslation = (lang: LanguageCode, field: "title" | "description", value: string) => {
    updateData((d) => ({
      ...d,
      data: {
        ...d.data,
        recipes: d.data.recipes.map((r) =>
          r.id === recipeId
            ? {
                ...r,
                translations: {
                  ...r.translations,
                  [lang]: { ...r.translations[lang], [field]: value },
                },
              }
            : r
        ),
      },
    }));
  };

  const updateInstructionStep = (lang: LanguageCode, index: number, value: string) => {
    updateData((d) => ({
      ...d,
      data: {
        ...d.data,
        recipes: d.data.recipes.map((r) => {
          if (r.id !== recipeId) return r;
          const steps = [...r.translations[lang].instructions];
          steps[index] = value;
          return {
            ...r,
            translations: {
              ...r.translations,
              [lang]: { ...r.translations[lang], instructions: steps },
            },
          };
        }),
      },
    }));
  };

  const addInstructionStep = () => {
    updateData((d) => ({
      ...d,
      data: {
        ...d.data,
        recipes: d.data.recipes.map((r) => {
          if (r.id !== recipeId) return r;
          return {
            ...r,
            translations: {
              de: { ...r.translations.de, instructions: [...r.translations.de.instructions, ""] },
              en: { ...r.translations.en, instructions: [...r.translations.en.instructions, ""] },
              nl: { ...r.translations.nl, instructions: [...r.translations.nl.instructions, ""] },
            },
          };
        }),
      },
    }));
  };

  const removeInstructionStep = (index: number) => {
    updateData((d) => ({
      ...d,
      data: {
        ...d.data,
        recipes: d.data.recipes.map((r) => {
          if (r.id !== recipeId) return r;
          return {
            ...r,
            translations: {
              de: { ...r.translations.de, instructions: r.translations.de.instructions.filter((_, i) => i !== index) },
              en: { ...r.translations.en, instructions: r.translations.en.instructions.filter((_, i) => i !== index) },
              nl: { ...r.translations.nl, instructions: r.translations.nl.instructions.filter((_, i) => i !== index) },
            },
          };
        }),
      },
    }));
  };

  const deleteRecipe = () => {
    updateData((d) => ({
      ...d,
      data: {
        ...d.data,
        recipes: d.data.recipes.filter((r) => r.id !== recipeId),
      },
    }));
    toast.success("Recipe deleted");
    router.push("/recipes/recipes");
  };

  // Ingredient management
  const addIngredient = () => {
    const newIngredient: Ingredient = {
      id: generateId("ing-"),
      amount: null,
      translations: {
        de: { name: "", unit: "" },
        en: { name: "", unit: "" },
        nl: { name: "", unit: "" },
      },
    };

    updateData((d) => ({
      ...d,
      data: {
        ...d.data,
        recipes: d.data.recipes.map((r) =>
          r.id === recipeId
            ? { ...r, ingredients: [...r.ingredients, newIngredient] }
            : r
        ),
      },
    }));
  };

  const removeIngredient = (ingredientId: string) => {
    updateData((d) => ({
      ...d,
      data: {
        ...d.data,
        recipes: d.data.recipes.map((r) =>
          r.id === recipeId
            ? { ...r, ingredients: r.ingredients.filter((i) => i.id !== ingredientId) }
            : r
        ),
      },
    }));
  };

  const updateIngredient = (ingredientId: string, updates: Partial<Ingredient>) => {
    updateData((d) => ({
      ...d,
      data: {
        ...d.data,
        recipes: d.data.recipes.map((r) =>
          r.id === recipeId
            ? {
                ...r,
                ingredients: r.ingredients.map((i) =>
                  i.id === ingredientId ? { ...i, ...updates } : i
                ),
              }
            : r
        ),
      },
    }));
  };

  const updateIngredientTranslation = (ingredientId: string, lang: LanguageCode, field: "name" | "unit", value: string) => {
    updateData((d) => ({
      ...d,
      data: {
        ...d.data,
        recipes: d.data.recipes.map((r) =>
          r.id === recipeId
            ? {
                ...r,
                ingredients: r.ingredients.map((i) =>
                  i.id === ingredientId
                    ? {
                        ...i,
                        translations: {
                          ...i.translations,
                          [lang]: { ...i.translations[lang], [field]: value },
                        },
                      }
                    : i
                ),
              }
            : r
        ),
      },
    }));
  };

  // Spices management
  const updateSpices = (lang: LanguageCode, spices: string[]) => {
    updateData((d) => ({
      ...d,
      data: {
        ...d.data,
        recipes: d.data.recipes.map((r) =>
          r.id === recipeId
            ? {
                ...r,
                spices: {
                  ...r.spices,
                  [lang]: spices,
                },
              }
            : r
        ),
      },
    }));
  };

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.push("/recipes/recipes")} className="gap-2 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Recipes
        </Button>
        <h1 className="text-3xl font-bold mb-2">
          {recipe.translations.en.title || "Untitled Recipe"}
        </h1>
        <p className="text-muted-foreground">
          Edit recipe details, ingredients, and instructions
        </p>
      </div>

      <div className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2 max-w-xs">
              <Label>
                Type
                <span className="text-destructive ml-1">*</span>
              </Label>
              <Select
                value={recipe.type}
                onValueChange={(value) => updateRecipe({ type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RECIPE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <LanguageSelector
              value={selectedLanguage}
              onChange={setSelectedLanguage}
              className="max-w-xs"
            />

            <MultiLanguageInput
              label="Recipe Title"
              value={recipe.translations}
              field="title"
              onChange={(lang, value) => updateRecipeTranslation(lang, "title", value)}
              placeholder="Enter recipe title"
              required
              selectedLanguage={selectedLanguage}
            />

            <MultiLanguageTextarea
              label="Description"
              value={recipe.translations}
              field="description"
              onChange={(lang, value) => updateRecipeTranslation(lang, "description", value)}
              placeholder="Enter recipe description"
              rows={3}
              selectedLanguage={selectedLanguage}
            />
          </CardContent>
        </Card>

        {/* Ingredients */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Ingredients</CardTitle>
              <Button variant="outline" size="sm" onClick={addIngredient} className="gap-1">
                <Plus className="h-3 w-3" />
                Add Ingredient
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Ingredient amounts should be entered for 10 persons. The app will automatically scale for other group sizes.
              </AlertDescription>
            </Alert>
            <LanguageSelector
              value={selectedLanguage}
              onChange={setSelectedLanguage}
              className="max-w-xs mb-4"
            />
            {recipe.ingredients.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border rounded-lg">
                <p className="text-sm">No ingredients yet</p>
                <Button variant="outline" size="sm" onClick={addIngredient} className="mt-3 gap-1">
                  <Plus className="h-3 w-3" />
                  Add First Ingredient
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recipe.ingredients.map((ingredient, index) => (
                  <div
                    key={ingredient.id}
                    className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30"
                  >
                    <span className="text-sm font-mono text-muted-foreground w-6">
                      {index + 1}.
                    </span>
                    <div className="w-20">
                      <Input
                        type="number"
                        placeholder="Amt"
                        value={ingredient.amount ?? ""}
                        onChange={(e) =>
                          updateIngredient(ingredient.id, {
                            amount: e.target.value ? parseFloat(e.target.value) : null,
                          })
                        }
                      />
                    </div>
                    <div className="w-24">
                      <Input
                        placeholder="Unit"
                        value={ingredient.translations[selectedLanguage]?.unit || ""}
                        onChange={(e) =>
                          updateIngredientTranslation(ingredient.id, selectedLanguage, "unit", e.target.value)
                        }
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        placeholder="Ingredient name"
                        value={ingredient.translations[selectedLanguage]?.name || ""}
                        onChange={(e) =>
                          updateIngredientTranslation(ingredient.id, selectedLanguage, "name", e.target.value)
                        }
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => removeIngredient(ingredient.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Spices */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Spices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <LanguageSelector
              value={selectedLanguage}
              onChange={setSelectedLanguage}
              className="max-w-xs"
            />
            <SpicesEditor
              spices={recipe.spices}
              onChange={updateSpices}
              selectedLanguage={selectedLanguage}
            />
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Cooking Instructions</CardTitle>
              <Button variant="outline" size="sm" onClick={addInstructionStep} className="gap-1">
                <Plus className="h-3 w-3" />
                Add Step
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <LanguageSelector
              value={selectedLanguage}
              onChange={setSelectedLanguage}
              className="max-w-xs"
            />
            {recipe.translations[selectedLanguage].instructions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border rounded-lg">
                <p className="text-sm">No instruction steps yet</p>
                <Button variant="outline" size="sm" onClick={addInstructionStep} className="mt-3 gap-1">
                  <Plus className="h-3 w-3" />
                  Add First Step
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recipe.translations[selectedLanguage].instructions.map((step, index) => (
                  <div
                    key={index}
                    className="flex gap-3 p-3 border rounded-lg bg-muted/30"
                  >
                    <span className="text-sm font-mono text-muted-foreground w-6 pt-2">
                      {index + 1}.
                    </span>
                    <textarea
                      className="flex-1 min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      placeholder={`Step ${index + 1}`}
                      value={step}
                      onChange={(e) => updateInstructionStep(selectedLanguage, index, e.target.value)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive mt-1"
                      onClick={() => removeInstructionStep(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Delete this recipe</p>
                <p className="text-sm text-muted-foreground">
                  This action cannot be undone.
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Recipe
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Recipe?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this recipe and all its ingredients. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteRecipe}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Recipe
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Spices Editor Component
function SpicesEditor({
  spices,
  onChange,
  selectedLanguage,
}: {
  spices: { de: string[]; en: string[]; nl: string[] };
  onChange: (lang: LanguageCode, spices: string[]) => void;
  selectedLanguage: LanguageCode;
}) {
  const [newSpice, setNewSpice] = useState("");

  const addSpice = () => {
    if (newSpice.trim()) {
      onChange(selectedLanguage, [...spices[selectedLanguage], newSpice.trim()]);
      setNewSpice("");
    }
  };

  const removeSpice = (index: number) => {
    onChange(selectedLanguage, spices[selectedLanguage].filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          placeholder="Add spice..."
          value={newSpice}
          onChange={(e) => setNewSpice(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addSpice();
            }
          }}
        />
        <Button
          variant="outline"
          size="icon"
          onClick={addSpice}
          disabled={!newSpice.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-1 min-h-[80px]">
        {spices[selectedLanguage].length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No spices added</p>
        ) : (
          spices[selectedLanguage].map((spice, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-2 px-3 py-2 bg-muted rounded-md"
            >
              <span className="text-sm truncate">{spice}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                onClick={() => removeSpice(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
