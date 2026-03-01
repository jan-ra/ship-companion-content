"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAppDataStore } from "@/lib/store";
import { generateNumericId } from "@/lib/json-utils";
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
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, ArrowLeft, Navigation, List, Map, Search, Info } from "lucide-react";
import { toast } from "sonner";
import { OpenStreetMap } from "@/components/openstreetmap";
import type { LanguageCode, InterestPoint, PointType } from "@/lib/types";
import { useT } from "@/lib/i18n";
import { useUiLanguage, useDevMode } from "@/lib/preferences-store";

export default function CityPointsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const cityId = parseInt(searchParams.get("id") ?? "0");

  const { data, updateData } = useAppDataStore();
  const { t } = useT();
  const uiLanguage = useUiLanguage();
  const [selectedPointId, setSelectedPointId] = useState<number | null>(null);
  const [deletePointId, setDeletePointId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(uiLanguage);
  const [coordPasteValue, setCoordPasteValue] = useState("");
  const devMode = useDevMode();

  const POINT_TYPES: { value: PointType; label: string }[] = [
    { value: "port", label: t("cities.pointTypePort") },
    { value: "shop", label: t("cities.pointTypeShop") },
    { value: "food", label: t("cities.pointTypeFood") },
    { value: "attraction", label: t("cities.pointTypeAttraction") },
    { value: "beach", label: t("cities.pointTypeBeach") },
    { value: "trash", label: t("cities.pointTypeTrash") },
    { value: "shower", label: t("cities.pointTypeShower") },
  ];

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No data loaded</p>
      </div>
    );
  }

  const cities = data.data.cities;
  const points = data.data.points;
  const city = cities.find((c) => c.id === cityId);

  if (!city) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={() => router.push("/maps/cities")} className="gap-2 mb-4">
          <ArrowLeft className="h-4 w-4" />
          {t("common.backToCities")}
        </Button>
        <p className="text-muted-foreground">{t("common.cityNotFound")}</p>
      </div>
    );
  }

  const cityPoints = points.filter((p) => p.cityId === cityId);
  const selectedPoint = selectedPointId !== null ? points.find((p) => p.id === selectedPointId) : null;

  // Filter points based on search query
  const filteredPoints = cityPoints.filter((point) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      point.translations.en.name?.toLowerCase().includes(query) ||
      point.translations.de.name?.toLowerCase().includes(query) ||
      point.translations.nl.name?.toLowerCase().includes(query) ||
      point.type.toLowerCase().includes(query)
    );
  });

  const getPointTypeLabel = (type: PointType) => {
    return POINT_TYPES.find((t) => t.value === type)?.label || type;
  };

  const addPoint = () => {
    const newId = generateNumericId(points.map((p) => p.id));
    const newPoint: InterestPoint = {
      id: newId,
      latitude: city.latitude,
      longitude: city.longitude,
      type: "attraction",
      cityId: cityId,
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
        points: [...d.data.points, newPoint],
      },
    }));

    setSelectedPointId(newId);
    toast.success(t("cities.toastPointAdded"));
  };

  const removePoint = (id: number) => {
    updateData((d) => ({
      ...d,
      data: {
        ...d.data,
        points: d.data.points.filter((p) => p.id !== id),
      },
    }));
    setDeletePointId(null);
    if (selectedPointId === id) {
      setSelectedPointId(null);
    }
    toast.success(t("cities.toastPointDeleted"));
  };

  const updatePoint = (id: number, updates: Partial<InterestPoint>, skipCustomerEdited = false) => {
    updateData((d) => ({
      ...d,
      data: {
        ...d.data,
        points: d.data.points.map((p) =>
          p.id === id ? { ...p, ...updates, ...(skipCustomerEdited ? {} : { customerEdited: true }) } : p
        ),
      },
    }));
  };

  const updatePointTranslation = (id: number, lang: LanguageCode, field: "name" | "description", value: string) => {
    updateData((d) => ({
      ...d,
      data: {
        ...d.data,
        points: d.data.points.map((p) =>
          p.id === id
            ? {
                ...p,
                customerEdited: true,
                translations: {
                  ...p.translations,
                  [lang]: { ...p.translations[lang], [field]: value },
                },
              }
            : p
        ),
      },
    }));
  };

  const handleCoordPaste = (value: string) => {
    setCoordPasteValue(value);
    const match = value.trim().match(/^(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)$/);
    if (match && selectedPoint) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[2]);
      if (!isNaN(lat) && !isNaN(lng)) {
        updatePoint(selectedPoint.id, { latitude: lat, longitude: lng });
        setCoordPasteValue("");
      } else {
        toast.error(t("cities.pasteFromMapsInvalid"));
      }
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.push("/maps/cities")} className="gap-2 mb-4">
          <ArrowLeft className="h-4 w-4" />
          {t("common.backToCities")}
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {t("cities.pointsOfInterest")}
            </h1>
            <p className="text-muted-foreground">
              {t("cities.pointsSubtitle", { cityName: city.translations[uiLanguage].name || city.translations.en.name || `City #${cityId}`, count: cityPoints.length })}
            </p>
          </div>
          <Button onClick={addPoint} className="gap-2">
            <Plus className="h-4 w-4" />
            {t("cities.addPoint")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Points List or Map */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{t("cities.allPoints")}</CardTitle>
                <div className="flex gap-1 p-1 bg-muted rounded-lg">
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    className={`h-8 px-3 gap-2 ${viewMode === "list" ? "shadow-sm" : ""}`}
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                    <span className="text-sm">{t("common.list")}</span>
                  </Button>
                  <Button
                    variant={viewMode === "map" ? "default" : "ghost"}
                    size="sm"
                    className={`h-8 px-3 gap-2 ${viewMode === "map" ? "shadow-sm" : ""}`}
                    onClick={() => setViewMode("map")}
                  >
                    <Map className="h-4 w-4" />
                    <span className="text-sm">{t("common.map")}</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {viewMode === "list" ? (
                cityPoints.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Navigation className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p>{t("cities.noPoints")}</p>
                    <Button onClick={addPoint} variant="outline" className="mt-4 gap-2">
                      <Plus className="h-4 w-4" />
                      {t("cities.addFirstPoint")}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={t("cities.searchPointsPlaceholder")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <div className="space-y-2 max-h-[540px] overflow-y-auto">
                      {filteredPoints.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>{t("cities.noPointsSearch")}</p>
                        </div>
                      ) : filteredPoints.map((point) => (
                        <button
                          key={point.id}
                          onClick={() => setSelectedPointId(point.id)}
                          className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 text-left transition-all
                            ${selectedPointId === point.id
                              ? "bg-primary/10 border-primary ring-2 ring-primary/20"
                              : point.customerEdited
                                ? "border-amber-300 bg-amber-50/40 hover:bg-amber-50/70 hover:border-amber-400"
                                : "border-border hover:bg-accent/50 hover:border-accent"}`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium truncate">
                                {point.translations[uiLanguage].name || point.translations.en.name || t("cities.pointFallback", { id: point.id })}
                              </span>
                              {point.customerEdited && (
                                <Badge variant="outline" className="text-amber-700 border-amber-400 bg-amber-50 text-xs shrink-0">
                                  Edited
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {getPointTypeLabel(point.type)}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )
              ) : (
                <div className="h-[600px] rounded-lg overflow-hidden">
                  <OpenStreetMap
                    centerLatitude={city.latitude}
                    centerLongitude={city.longitude}
                    points={cityPoints}
                    selectedPointId={selectedPointId}
                    onPointClick={(id) => setSelectedPointId(id)}
                    zoom={city.zoomLevel || 14}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Point Edit Form */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">
                {selectedPoint
                  ? selectedPoint.translations[uiLanguage].name || selectedPoint.translations.en.name || t("cities.pointFallback", { id: selectedPoint.id })
                  : t("cities.pointDetails")}
              </CardTitle>
              {selectedPoint?.customerEdited && (
                <Badge variant="outline" className="text-amber-700 border-amber-400 bg-amber-50 text-xs">
                  Edited
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {selectedPoint ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>
                      {t("cities.typeLabel")}
                      <span className="text-destructive ml-1">*</span>
                    </Label>
                    <Select
                      value={selectedPoint.type}
                      onValueChange={(value) => updatePoint(selectedPoint.id, { type: value as PointType })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {POINT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("cities.cityLabel")}</Label>
                    <Input
                      value={city.translations[uiLanguage].name || city.translations.en.name || t("cities.cityFallback", { id: cityId })}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t("cities.pasteFromMaps")}</Label>
                  <Input
                    type="text"
                    placeholder={t("cities.pasteFromMapsPlaceholder")}
                    value={coordPasteValue}
                    onChange={(e) => handleCoordPaste(e.target.value)}
                  />
                  <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800 py-2">
                    <Info className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800 text-xs">
                      {t("cities.pasteFromMapsHint")}
                    </AlertDescription>
                  </Alert>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>
                      {t("cities.latitudeLabel")}
                      <span className="text-destructive ml-1">*</span>
                    </Label>
                    <Input
                      type="number"
                      step="0.000001"
                      min="-180"
                      max="180"
                      value={selectedPoint.latitude}
                      onChange={(e) =>
                        updatePoint(selectedPoint.id, { latitude: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      {t("cities.longitudeLabel")}
                      <span className="text-destructive ml-1">*</span>
                    </Label>
                    <Input
                      type="number"
                      step="0.000001"
                      min="-180"
                      max="180"
                      value={selectedPoint.longitude}
                      onChange={(e) =>
                        updatePoint(selectedPoint.id, { longitude: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>

                {devMode && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("cities.displayLatLabel")}</Label>
                    <Input
                      type="number"
                      step="0.000001"
                      min="-180"
                      max="180"
                      value={selectedPoint.displayLatitude || ""}
                      onChange={(e) =>
                        updatePoint(selectedPoint.id, {
                          displayLatitude: e.target.value ? parseFloat(e.target.value) : undefined,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("cities.displayLngLabel")}</Label>
                    <Input
                      type="number"
                      step="0.000001"
                      min="-180"
                      max="180"
                      value={selectedPoint.displayLongitude || ""}
                      onChange={(e) =>
                        updatePoint(selectedPoint.id, {
                          displayLongitude: e.target.value ? parseFloat(e.target.value) : undefined,
                        })
                      }
                    />
                  </div>
                </div>
                )}

                <LanguageSelector
                  value={selectedLanguage}
                  onChange={setSelectedLanguage}
                  className="max-w-xs"
                />

                <MultiLanguageInput
                  label="Point Name"
                  value={selectedPoint.translations}
                  field="name"
                  onChange={(lang, value) => updatePointTranslation(selectedPoint.id, lang, "name", value)}
                  placeholder="Enter point name"
                  required
                  selectedLanguage={selectedLanguage}
                />

                <MultiLanguageTextarea
                  label="Description"
                  value={selectedPoint.translations}
                  field="description"
                  onChange={(lang, value) => updatePointTranslation(selectedPoint.id, lang, "description", value)}
                  placeholder="Enter point description"
                  rows={4}
                  required
                  selectedLanguage={selectedLanguage}
                />

                <div className="flex items-center justify-between">
                  {devMode ? (
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={selectedPoint.customerEdited === true}
                        onCheckedChange={(checked) => updatePoint(selectedPoint.id, { customerEdited: checked }, true)}
                      />
                      <Label className="font-normal">Customer Edited</Label>
                    </div>
                  ) : <div />}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeletePointId(selectedPoint.id)}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    {t("cities.deletePoint")}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Navigation className="h-12 w-12 mb-4 opacity-50" />
                <p>{t("cities.selectPointToEdit")}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Point Confirmation */}
      <AlertDialog open={deletePointId !== null} onOpenChange={() => setDeletePointId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("cities.deletePointTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("cities.deletePointDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletePointId !== null && removePoint(deletePointId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("cities.deletePoint")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
