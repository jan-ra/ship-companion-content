"use client";

import { useState, useMemo } from "react";
import { useAppDataStore } from "@/lib/store";
import { usePreferencesStore } from "@/lib/preferences-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { Calendar, FileJson, Ship as ShipIcon, Code, HardDrive, Lock } from "lucide-react";
import { useT } from "@/lib/i18n";

export default function GeneralPage() {
  const { data, updateData, images } = useAppDataStore();
  const { devMode, setDevMode } = usePreferencesStore();
  const { t } = useT();
  const [showDevModeDialog, setShowDevModeDialog] = useState(false);
  const [pendingDevMode, setPendingDevMode] = useState(false);

  const { imagesSize, imageCount, dataSize, totalSize } = useMemo(() => {
    let imgSize = 0;
    let imgCount = 0;
    if (images) {
      for (const blob of images.values()) {
        imgSize += blob.size;
        imgCount++;
      }
    }
    const json = JSON.stringify(data);
    const dSize = new Blob([json]).size;
    return {
      imagesSize: imgSize,
      imageCount: imgCount,
      dataSize: dSize,
      totalSize: imgSize + dSize,
    };
  }, [data, images]);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">{t("common.noDataLoaded")}</p>
      </div>
    );
  }

  function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{t("general.title")}</h1>
        <p className="text-muted-foreground">
          {t("general.subtitle")}
        </p>
      </div>

      <div className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {t("general.basicInfo")}
              {!devMode && <Lock className="h-4 w-4 text-muted-foreground" />}
            </CardTitle>
            <CardDescription>
              {devMode ? t("general.basicInfoDesc") : t("general.devModeRequired")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shipName">
                {t("general.shipName")}
                <span className="text-destructive ml-1">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <ShipIcon className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="shipName"
                  value={data.shipName}
                  onChange={(e) =>
                    updateData((d) => ({ ...d, shipName: e.target.value }))
                  }
                  placeholder={t("general.shipNamePlaceholder")}
                  disabled={!devMode}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="version">
                {t("general.version")}
                <span className="text-destructive ml-1">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <FileJson className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="version"
                  value={data.version}
                  onChange={(e) =>
                    updateData((d) => ({ ...d, version: e.target.value }))
                  }
                  placeholder={t("general.versionPlaceholder")}
                  pattern="\d+\.\d+\.\d+"
                  title={t("general.versionTitle")}
                  disabled={!devMode}
                  required
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {t("general.versionHint")}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Export Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t("general.exportInfo")}</CardTitle>
            <CardDescription>{t("general.exportInfoDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{t("general.lastExported")}</span>
              <Badge variant="outline">
                {new Date(data.exportDate).toLocaleString()}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {t("general.exportDateNote")}
            </p>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>{t("general.statistics")}</CardTitle>
            <CardDescription>{t("general.statisticsDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t("general.statRecipes")}</p>
                <p className="text-2xl font-bold">{data.data.recipes.length}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t("general.statCities")}</p>
                <p className="text-2xl font-bold">{data.data.cities.length}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t("general.statPoints")}</p>
                <p className="text-2xl font-bold">{data.data.points.length}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t("general.statCabins")}</p>
                <p className="text-2xl font-bold">{data.data.cabins.length}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t("general.statChecklists")}</p>
                <p className="text-2xl font-bold">{data.data.checklists.length}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t("general.statFaqItems")}</p>
                <p className="text-2xl font-bold">{data.data.questions.length}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t("general.statShipFacts")}</p>
                <p className="text-2xl font-bold">{data.data.about.facts.length}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t("general.statEquipment")}</p>
                <p className="text-2xl font-bold">
                  {data.data.about.equipment?.length || 0}
                </p>
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <div className="flex items-center gap-2 mb-3">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">{t("general.storage")}</p>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
                <span>{t("general.storageAppData", { size: formatBytes(dataSize) })}</span>
                <span>{t("general.storageImages", { count: imageCount, size: formatBytes(imagesSize) })}</span>
                <span className="font-medium text-foreground">{t("general.storageTotal", { size: formatBytes(totalSize) })}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dev Mode */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              {t("general.devMode")}
            </CardTitle>
            <CardDescription>
              {t("general.devModeDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dev-mode">{t("general.devModeLabel")}</Label>
                <p className="text-sm text-muted-foreground">
                  {devMode
                    ? t("general.devModeOn")
                    : t("general.devModeOff")}
                </p>
              </div>
              <Switch
                id="dev-mode"
                checked={devMode}
                onCheckedChange={(checked) => {
                  setPendingDevMode(checked);
                  setShowDevModeDialog(true);
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showDevModeDialog} onOpenChange={setShowDevModeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingDevMode ? t("general.enableDevMode") : t("general.disableDevMode")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDevMode
                ? t("general.enableDevModeDesc")
                : t("general.disableDevModeDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => setDevMode(pendingDevMode)}
            >
              {pendingDevMode ? t("common.enable") : t("common.disable")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
