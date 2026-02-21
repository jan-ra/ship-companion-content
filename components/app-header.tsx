"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { useAppDataStore } from "@/lib/store";
import { importAppConfFile, exportAppConfFile } from "@/lib/json-utils";
import { Download, Upload, AlertCircle, Image } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export function AppHeader() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data, images, setData, hasUnsavedChanges } = useAppDataStore();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const { data: appData, images: imageMap } = await importAppConfFile(file);
      setData(appData, imageMap);
      toast.success(`File imported successfully! Loaded ${imageMap.size} images.`);
    } catch (error) {
      toast.error((error as Error).message);
    }

    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleExport = async () => {
    if (!data) {
      toast.error("No data to export");
      return;
    }

    try {
      await exportAppConfFile(data, images);
      toast.success("File exported successfully as .appconf!");
    } catch (error) {
      toast.error("Failed to export file: " + (error as Error).message);
    }
  };

  return (
    <header className="border-b bg-background">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">Ship Companion Content Editor</h1>
          {data && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{data.shipName}</Badge>
              <Badge variant="outline">v{data.version}</Badge>
              {images.size > 0 && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Image className="h-3 w-3" />
                  {images.size} {images.size === 1 ? 'image' : 'images'}
                </Badge>
              )}
              {hasUnsavedChanges && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Unsaved Changes
                </Badge>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".appconf"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            Import
          </Button>

          <Button
            onClick={handleExport}
            disabled={!data}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {!data && (
        <Alert className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please import an .appconf file to get started. Use the Import button above.
          </AlertDescription>
        </Alert>
      )}
    </header>
  );
}
