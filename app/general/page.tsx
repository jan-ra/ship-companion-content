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
import { Calendar, FileJson, Ship as ShipIcon, Code, HardDrive } from "lucide-react";

export default function GeneralPage() {
  const { data, updateData, images } = useAppDataStore();
  const { devMode, setDevMode } = usePreferencesStore();
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
        <p className="text-muted-foreground">No data loaded</p>
      </div>
    );
  }

  function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">General Settings</h1>
        <p className="text-muted-foreground">
          Manage general metadata and information about your ship companion app
        </p>
      </div>

      <div className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Edit ship name and version</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shipName">
                Ship Name
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
                  placeholder="Enter ship name"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="version">
                Version
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
                  placeholder="e.g., 2.0.0"
                  pattern="\d+\.\d+\.\d+"
                  title="Version must be in format X.Y.Z"
                  required
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Use semantic versioning (e.g., 2.0.0)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Export Information */}
        <Card>
          <CardHeader>
            <CardTitle>Export Information</CardTitle>
            <CardDescription>Last export date (read-only)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Last exported:</span>
              <Badge variant="outline">
                {new Date(data.exportDate).toLocaleString()}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              This date will be automatically updated when you export the file
            </p>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Data Statistics</CardTitle>
            <CardDescription>Overview of your content</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Recipes</p>
                <p className="text-2xl font-bold">{data.data.recipes.length}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Cities</p>
                <p className="text-2xl font-bold">{data.data.cities.length}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Points</p>
                <p className="text-2xl font-bold">{data.data.points.length}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Cabins</p>
                <p className="text-2xl font-bold">{data.data.cabins.length}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Checklists</p>
                <p className="text-2xl font-bold">{data.data.checklists.length}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">FAQ Items</p>
                <p className="text-2xl font-bold">{data.data.questions.length}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Ship Facts</p>
                <p className="text-2xl font-bold">{data.data.about.facts.length}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Equipment</p>
                <p className="text-2xl font-bold">
                  {data.data.about.equipment?.length || 0}
                </p>
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <div className="flex items-center gap-2 mb-3">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">Storage</p>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
                <span>App data: {formatBytes(dataSize)}</span>
                <span>Images ({imageCount}): {formatBytes(imagesSize)}</span>
                <span className="font-medium text-foreground">Total: {formatBytes(totalSize)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dev Mode */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Developer Mode
            </CardTitle>
            <CardDescription>
              Enable advanced editing features and developer tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dev-mode">Developer Mode</Label>
                <p className="text-sm text-muted-foreground">
                  {devMode
                    ? "Advanced features are visible"
                    : "Some features are hidden"}
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
              {pendingDevMode ? "Enable Developer Mode?" : "Disable Developer Mode?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDevMode
                ? "This will show advanced editing features that are normally hidden. Only enable this if you know what you are doing."
                : "This will hide advanced editing features. You can re-enable it at any time."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => setDevMode(pendingDevMode)}
            >
              {pendingDevMode ? "Enable" : "Disable"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
