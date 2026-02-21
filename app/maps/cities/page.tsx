"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDataStore } from "@/lib/store";
import { generateNumericId } from "@/lib/json-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { OpenStreetMap } from "@/components/openstreetmap";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Plus, Trash2, MapPin, Navigation, List, Map, Search, Info } from "lucide-react";
import { toast } from "sonner";
import { useDevMode } from "@/lib/preferences-store";
import type { LanguageCode, City } from "@/lib/types";

export default function CitiesPage() {
  const router = useRouter();
  const { data, updateData } = useAppDataStore();
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
  const [deleteCityId, setDeleteCityId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>("en");
  const devMode = useDevMode();

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No data loaded</p>
      </div>
    );
  }

  const cities = data.data.cities;
  const points = data.data.points;

  const selectedCity = selectedCityId !== null ? cities.find((c) => c.id === selectedCityId) : null;
  const selectedCityIndex = selectedCity ? cities.findIndex((c) => c.id === selectedCityId) : -1;

  const getPointsForCity = (cityId: number) => points.filter((p) => p.cityId === cityId);

  const addCity = () => {
    const newId = generateNumericId(cities.map((c) => c.id));
    const newCity: City = {
      id: newId,
      latitude: 52.5,
      longitude: 5.5,
      zoomLevel: 12,
      isIsland: "no",
      translations: {
        de: { name: "", description: "" },
        en: { name: "", description: "" },
        nl: { name: "", description: "" },
      },
    };

    updateData((d) => ({
      ...d,
      data: {
        ...d.data,
        cities: [...d.data.cities, newCity],
      },
    }));

    setSelectedCityId(newId);
    toast.success("New city added");
  };

  const removeCity = (id: number) => {
    const pointsUsingCity = points.filter((p) => p.cityId === id);
    if (pointsUsingCity.length > 0) {
      toast.error(`Cannot delete: ${pointsUsingCity.length} points reference this city`);
      setDeleteCityId(null);
      return;
    }

    updateData((d) => ({
      ...d,
      data: {
        ...d.data,
        cities: d.data.cities.filter((c) => c.id !== id),
      },
    }));
    setDeleteCityId(null);
    if (selectedCityId === id) {
      setSelectedCityId(null);
    }
    toast.success("City deleted");
  };

  const updateCity = (id: number, updates: Partial<City>) => {
    updateData((d) => ({
      ...d,
      data: {
        ...d.data,
        cities: d.data.cities.map((c) => (c.id === id ? { ...c, ...updates } : c)),
      },
    }));
  };

  const updateCityTranslation = (id: number, lang: LanguageCode, field: "name" | "description", value: string) => {
    updateData((d) => ({
      ...d,
      data: {
        ...d.data,
        cities: d.data.cities.map((c) =>
          c.id === id
            ? {
                ...c,
                translations: {
                  ...c.translations,
                  [lang]: { ...c.translations[lang], [field]: value },
                },
              }
            : c
        ),
      },
    }));
  };

  // Create pseudo-points for cities to display on map
  const cityMarkers = cities.map((city) => ({
    id: city.id,
    latitude: city.latitude,
    longitude: city.longitude,
    type: "port" as const,
    cityId: city.id,
    translations: city.translations,
  }));

  // Filter cities based on search query
  const filteredCities = cities.filter((city) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      city.translations.en.name?.toLowerCase().includes(query) ||
      city.translations.de.name?.toLowerCase().includes(query) ||
      city.translations.nl.name?.toLowerCase().includes(query)
    );
  });

  // Calculate map center (average of all cities, or default)
  const mapCenter = cities.length > 0
    ? {
        lat: cities.reduce((sum, c) => sum + c.latitude, 0) / cities.length,
        lng: cities.reduce((sum, c) => sum + c.longitude, 0) / cities.length,
      }
    : { lat: 52.5, lng: 5.5 };

  return (
    <div className="p-6 max-w-6xl">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Cities</h1>
            <p className="text-muted-foreground">
              Manage cities and locations · {cities.length} cities
            </p>
          </div>
          {devMode && (
            <Button onClick={addCity} className="gap-2">
              <Plus className="h-4 w-4" />
              Add City
            </Button>
          )}
        </div>
      </div>

      {!devMode && (
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Adding cities requires developer access</AlertTitle>
          <AlertDescription>
            New cities require adjustments to the underlying map data. Please reach out to the developer if a city should be added.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Cities List or Map */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">All Cities</CardTitle>
                <div className="flex gap-1 p-1 bg-muted rounded-lg">
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    className={`h-8 px-3 gap-2 ${viewMode === "list" ? "shadow-sm" : ""}`}
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                    <span className="text-sm">List</span>
                  </Button>
                  <Button
                    variant={viewMode === "map" ? "default" : "ghost"}
                    size="sm"
                    className={`h-8 px-3 gap-2 ${viewMode === "map" ? "shadow-sm" : ""}`}
                    onClick={() => setViewMode("map")}
                  >
                    <Map className="h-4 w-4" />
                    <span className="text-sm">Map</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {viewMode === "list" ? (
                cities.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <MapPin className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p>No cities yet</p>
                    <Button onClick={addCity} variant="outline" className="mt-4 gap-2">
                      <Plus className="h-4 w-4" />
                      Add First City
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search cities..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <div className="space-y-2 max-h-[540px] overflow-y-auto">
                    {filteredCities.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No cities match your search</p>
                      </div>
                    ) : filteredCities.map((city) => {
                      const cityPointCount = getPointsForCity(city.id).length;
                      return (
                        <button
                          key={city.id}
                          onClick={() => setSelectedCityId(city.id)}
                          className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 text-left transition-all
                            ${selectedCityId === city.id
                              ? "bg-primary/10 border-primary ring-2 ring-primary/20"
                              : "border-border hover:bg-accent/50 hover:border-accent"}`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">
                              {city.translations.en.name || `City #${city.id}`}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {cityPointCount} POI{cityPointCount !== 1 ? "s" : ""} · ({city.latitude.toFixed(2)}, {city.longitude.toFixed(2)})
                            </div>
                          </div>
                        </button>
                      );
                    })}
                    </div>
                  </div>
                )
              ) : (
                <div className="h-[600px] rounded-lg overflow-hidden">
                  <OpenStreetMap
                    centerLatitude={mapCenter.lat}
                    centerLongitude={mapCenter.lng}
                    points={cityMarkers}
                    selectedPointId={selectedCityId}
                    onPointClick={(id) => setSelectedCityId(id)}
                    zoom={8}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* City Edit Form */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedCity
                ? selectedCity.translations.en.name || `City #${selectedCity.id}`
                : "City Details"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedCity ? (
              <div className="space-y-6">
                {devMode && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>
                        Latitude
                        <span className="text-destructive ml-1">*</span>
                      </Label>
                      <Input
                        type="number"
                        step="0.000001"
                        min="-180"
                        max="180"
                        value={selectedCity.latitude}
                        onChange={(e) =>
                          updateCity(selectedCity.id, { latitude: parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>
                        Longitude
                        <span className="text-destructive ml-1">*</span>
                      </Label>
                      <Input
                        type="number"
                        step="0.000001"
                        min="-180"
                        max="180"
                        value={selectedCity.longitude}
                        onChange={(e) =>
                          updateCity(selectedCity.id, { longitude: parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Display Latitude (optional)</Label>
                      <Input
                        type="number"
                        step="0.000001"
                        min="-180"
                        max="180"
                        value={selectedCity.displayLatitude || ""}
                        onChange={(e) =>
                          updateCity(selectedCity.id, {
                            displayLatitude: e.target.value ? parseFloat(e.target.value) : undefined,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Display Longitude (optional)</Label>
                      <Input
                        type="number"
                        step="0.000001"
                        min="-180"
                        max="180"
                        value={selectedCity.displayLongitude || ""}
                        onChange={(e) =>
                          updateCity(selectedCity.id, {
                            displayLongitude: e.target.value ? parseFloat(e.target.value) : undefined,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>
                        Zoom Level (1-22)
                        <span className="text-destructive ml-1">*</span>
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        max="22"
                        value={selectedCity.zoomLevel}
                        onChange={(e) =>
                          updateCity(selectedCity.id, {
                            zoomLevel: Math.max(1, Math.min(22, parseInt(e.target.value) || 12)),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Is Island?</Label>
                      <div className="flex items-center space-x-2 pt-2">
                        <Switch
                          checked={selectedCity.isIsland === "yes"}
                          onCheckedChange={(checked) =>
                            updateCity(selectedCity.id, { isIsland: checked ? "yes" : "no" })
                          }
                        />
                        <Label className="font-normal">
                          {selectedCity.isIsland === "yes" ? "Yes" : "No"}
                        </Label>
                      </div>
                    </div>
                  </div>
                </>
              )}

                <LanguageSelector
                  value={selectedLanguage}
                  onChange={setSelectedLanguage}
                  className="max-w-xs"
                />

                <MultiLanguageInput
                  label="City Name"
                  value={selectedCity.translations}
                  field="name"
                  onChange={(lang, value) => updateCityTranslation(selectedCity.id, lang, "name", value)}
                  placeholder="Enter city name"
                  required
                  selectedLanguage={selectedLanguage}
                />

                <MultiLanguageTextarea
                  label="Description"
                  value={selectedCity.translations}
                  field="description"
                  onChange={(lang, value) => updateCityTranslation(selectedCity.id, lang, "description", value)}
                  placeholder="Enter city description"
                  rows={4}
                  required
                  selectedLanguage={selectedLanguage}
                />

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/maps/cities/${selectedCity.id}/points`)}
                    className="gap-2"
                  >
                    <Navigation className="h-4 w-4" />
                    Manage Points of Interest ({getPointsForCity(selectedCity.id).length})
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteCityId(selectedCity.id)}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete City
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <MapPin className="h-12 w-12 mb-4 opacity-50" />
                <p>Select a city to edit or add a new one</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete City Confirmation */}
      <AlertDialog open={deleteCityId !== null} onOpenChange={() => setDeleteCityId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete City?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this city. This action cannot be undone.
              {deleteCityId && getPointsForCity(deleteCityId).length > 0 && (
                <span className="block mt-2 text-destructive">
                  Warning: This city has {getPointsForCity(deleteCityId).length} points of interest that must be deleted first.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteCityId !== null && removeCity(deleteCityId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete City
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
