"use client";

import { useEffect, useState } from "react";
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

export function RestoreDataDialog() {
  const [showDialog, setShowDialog] = useState(false);
  const [timestamp, setTimestamp] = useState<Date | null>(null);
  const { data, setData } = useAppDataStore();

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
      setData(storedData, storedImages);
      toast.success("Data restored from browser storage");
    }
    setShowDialog(false);
  };

  const handleDiscard = async () => {
    await clearAllStorage();
    toast.info("Stored data discarded");
    setShowDialog(false);
  };

  const formatTimestamp = (date: Date | null) => {
    if (!date) return "unknown time";
    return date.toLocaleString();
  };

  return (
    <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Restore Previous Session?</AlertDialogTitle>
          <AlertDialogDescription>
            Found unsaved data from a previous session
            {timestamp && (
              <span className="block mt-2 text-sm">
                Last modified: {formatTimestamp(timestamp)}
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleDiscard}>
            Discard
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleRestore}>
            Restore Data
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
