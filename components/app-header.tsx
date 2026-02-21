"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAppDataStore } from "@/lib/store";
import { importAppConfFile, exportAppConfFile } from "@/lib/json-utils";
import { Download, Upload, AlertCircle, Image, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
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

export function AppHeader() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data, images, setData, hasUnsavedChanges } = useAppDataStore();
  const [showFolderDialog, setShowFolderDialog] = useState(false);
  const [folderUrl, setFolderUrl] = useState<string | null>(null);

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

      if (data.appconf_folder_id) {
        setFolderUrl(`https://drive.google.com/drive/folders/${data.appconf_folder_id}`);
        setShowFolderDialog(true);
      }
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

      <AlertDialog open={showFolderDialog} onOpenChange={setShowFolderDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Open upload folder?</AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to open the Google Drive folder where you need to upload the exported file?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, thanks</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (folderUrl) window.open(folderUrl, "_blank");
              }}
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Open folder
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
}
