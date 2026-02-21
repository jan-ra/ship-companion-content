"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, X } from "lucide-react";
import { MATERIAL_ICONS, toSnakeCase, toKebabCase, getIconSvg } from "@/lib/material-icons";

interface MaterialIconSelectorProps {
  value: string;
  onChange: (iconName: string) => void;
  label?: string;
}

// Component to render a Material Icon from SVG
function MaterialIcon({ name, size = 24 }: { name: string; size?: number }) {
  const svg = getIconSvg(name);

  if (!svg) {
    return <div style={{ width: size, height: size }} />;
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      dangerouslySetInnerHTML={{ __html: svg }}
      style={{ display: 'block' }}
    />
  );
}

export function MaterialIconSelector({ value, onChange, label }: MaterialIconSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Filter icons based on search
  const filteredIcons = useMemo(() => {
    if (!search) return MATERIAL_ICONS;
    const searchLower = search.toLowerCase();
    return MATERIAL_ICONS.filter((iconName) =>
      iconName.toLowerCase().includes(searchLower)
    );
  }, [search]);

  const handleSelectIcon = (iconName: string) => {
    // Convert to snake_case before saving
    onChange(toSnakeCase(iconName));
    setOpen(false);
    setSearch("");
  };

  // Convert stored snake_case to kebab-case for display
  const displayValue = value ? toKebabCase(value) : "";

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}</label>}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start"
          onClick={() => setOpen(true)}
        >
          {displayValue ? (
            <div className="flex items-center gap-2">
              <MaterialIcon name={displayValue} size={20} />
              <span>{displayValue}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">Select an icon...</span>
          )}
        </Button>
        {value && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => onChange("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Select Material Icon</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search icons..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                autoFocus
              />
            </div>

            <div className="text-sm text-muted-foreground">
              {filteredIcons.length} icons found
            </div>

            <ScrollArea className="h-[400px] border rounded-md">
              <div className="grid grid-cols-6 gap-2 p-4">
                {filteredIcons.map((iconName) => {
                  return (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => handleSelectIcon(iconName)}
                      className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-accent transition-colors group"
                      title={iconName}
                    >
                      <MaterialIcon name={iconName} size={32} />
                      <span className="text-xs text-center line-clamp-2 group-hover:text-foreground text-muted-foreground">
                        {iconName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
