"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAppDataStore } from "@/lib/store";
import { importAppConfFile, exportAppConfFile } from "@/lib/json-utils";
import { Download, Upload, AlertCircle, Image, ExternalLink, HelpCircle } from "lucide-react";
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
import { UiLanguageSelector } from "@/components/ui-language-selector";
import { useT } from "@/lib/i18n";

export function AppHeader() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data, images, setData, hasUnsavedChanges } = useAppDataStore();
  const [showFolderDialog, setShowFolderDialog] = useState(false);
  const [folderUrl, setFolderUrl] = useState<string | null>(null);
  const { t } = useT();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const { data: appData, images: imageMap } = await importAppConfFile(file);
      setData(appData, imageMap);
      toast.success(t("toast.importSuccess", { count: imageMap.size }));
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
      toast.error(t("toast.noDataToExport"));
      return;
    }

    try {
      await exportAppConfFile(data, images);
      toast.success(t("toast.exportSuccess"));

      if (data.appconf_folder_id) {
        setFolderUrl(`https://drive.google.com/drive/folders/${data.appconf_folder_id}`);
        setShowFolderDialog(true);
      }
    } catch (error) {
      toast.error(t("toast.exportError", { message: (error as Error).message }));
    }
  };

  return (
    <header className="border-b bg-background">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">{t("app.title")}</h1>
          {data && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{data.shipName}</Badge>
              <Badge variant="outline">v{data.version}</Badge>
              {images.size > 0 && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Image className="h-3 w-3" />
                  {images.size} {images.size === 1 ? t("header.image") : t("header.images")}
                </Badge>
              )}
              {hasUnsavedChanges && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {t("header.unsavedChanges")}
                </Badge>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild className="gap-2">
            <Link href="/help">
              <HelpCircle className="h-4 w-4" />
              {t("help.buttonLabel")}
            </Link>
          </Button>
          <UiLanguageSelector />
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
            {t("header.import")}
          </Button>

          <Button
            onClick={handleExport}
            disabled={!data}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            {t("header.export")}
          </Button>
        </div>
      </div>

      {!data && (
        <Alert className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t("header.importAlert")}
          </AlertDescription>
        </Alert>
      )}

      <AlertDialog open={showFolderDialog} onOpenChange={setShowFolderDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("header.openFolderTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("header.openFolderDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("header.openFolderCancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (folderUrl) window.open(folderUrl, "_blank");
              }}
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              {t("header.openFolderConfirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
}
