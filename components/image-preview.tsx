"use client";

import { useState } from "react";
import { useAppDataStore } from "@/lib/store";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImagePreviewProps {
  filename: string;
  alt?: string;
  className?: string;
  showFilename?: boolean;
}

export function ImagePreview({ filename, alt, className, showFilename = false }: ImagePreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { getImageUrl, hasImage } = useAppDataStore();

  if (!filename || !hasImage(filename)) {
    return (
      <div className={cn("flex items-center justify-center bg-muted rounded-md p-4", className)}>
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <ImageIcon className="h-8 w-8" />
          <span className="text-xs">
            {filename ? `Image not found: ${filename}` : "No image"}
          </span>
        </div>
      </div>
    );
  }

  const imageUrl = getImageUrl(filename);

  if (!imageUrl) {
    return null;
  }

  return (
    <>
      <div className="space-y-2">
        <div
          className={cn("relative overflow-hidden rounded-md bg-muted cursor-pointer", className)}
          onClick={() => setIsOpen(true)}
        >
          <img
            src={imageUrl}
            alt={alt || filename}
            className="object-contain w-full h-full hover:opacity-90 transition-opacity"
          />
        </div>
        {showFilename && (
          <p className="text-xs text-muted-foreground truncate">{filename}</p>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl">
          <div className="relative w-full">
            <img
              src={imageUrl}
              alt={alt || filename}
              className="w-full h-auto"
            />
            {showFilename && (
              <p className="mt-4 text-sm text-muted-foreground text-center">{filename}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
