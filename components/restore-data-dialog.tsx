"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
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
import { useAppDataStore } from "@/lib/store";
import {
  hasDataInStorage,
  loadDataFromStorage,
  loadImagesFromStorage,
  getStorageTimestamp,
  clearAllStorage,
} from "@/lib/browser-storage";
import { toast } from "sonner";
import { useT } from "@/lib/i18n";

export function RestoreDataDialog() {
  const [showDialog, setShowDialog] = useState(false);
  const [timestamp, setTimestamp] = useState<Date | null>(null);
  const { data, setData } = useAppDataStore();
  const { t, lang } = useT();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only check on initial mount when there's no data loaded
    if (data) return;

    // Check if there's data in browser storage
    const hasStored = hasDataInStorage();
    if (hasStored) {
      const storedTimestamp = getStorageTimestamp();
      setTimestamp(storedTimestamp);
      setShowDialog(true);
    }
  }, []); // Only run on mount

  const handleRestore = async () => {
    const storedData = loadDataFromStorage();
    if (storedData) {
      const storedImages = await loadImagesFromStorage();
      // Pass persistImages=false: images are already in IndexedDB, no need to clear and rewrite them
      setData(storedData, storedImages, false);
      toast.success(t("restore.toastRestored"));
      // Stay on the current route (page was reloaded)
    }
    setShowDialog(false);
  };

  const handleDiscard = async () => {
    await clearAllStorage();
    toast.info(t("restore.toastDiscarded"));
    setShowDialog(false);
    // Only redirect to / if not already there
    if (pathname !== "/") {
      router.replace("/");
    }
  };

  const formatTimestamp = (date: Date | null) => {
    if (!date) return t("restore.unknownTime");
    const locale = lang === "de" ? "de-DE" : lang === "nl" ? "nl-NL" : "en-GB";
    return date.toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" });
  };

  return (
    <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("restore.title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("restore.description")}
            {timestamp && (
              <span className="block mt-2 text-sm">
                {t("restore.lastModified", { timestamp: formatTimestamp(timestamp) })}
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleDiscard}>
            {t("restore.discard")}
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleRestore}>
            {t("restore.restore")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
