"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, X } from "lucide-react";
import { ICON_GROUPS, MATERIAL_ICONS, toSnakeCase, toKebabCase, getIconSvg } from "@/lib/material-icons";
import { useT } from "@/lib/i18n";

interface MaterialIconSelectorProps {
  value: string;
  onChange: (iconName: string) => void;
  label?: string;
}

// Renders a single Material Icon from its inline SVG body
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
      style={{ display: "block" }}
    />
  );
}

// A single clickable icon tile
function IconTile({ name, onClick }: { name: string; onClick: () => void }) {
  const kebab = toKebabCase(name);
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-accent transition-colors group"
      title={kebab}
    >
      <MaterialIcon name={name} size={32} />
      <span className="text-xs text-center line-clamp-2 group-hover:text-foreground text-muted-foreground">
        {kebab}
      </span>
    </button>
  );
}

export function MaterialIconSelector({ value, onChange, label }: MaterialIconSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { t } = useT();

  const isSearching = search.trim().length > 0;

  // When searching: flat filtered list across all icons (kebab-case)
  const searchResults = useMemo(() => {
    if (!isSearching) return [];
    const q = search.toLowerCase();
    return MATERIAL_ICONS.filter((name) => name.toLowerCase().includes(q));
  }, [search, isSearching]);

  const handleSelectIcon = (name: string) => {
    // name may be kebab-case (search results) or snake_case (group icons)
    onChange(toSnakeCase(name));
    setOpen(false);
    setSearch("");
  };

  // Convert stored snake_case to kebab-case for display
  const displayValue = value ? toKebabCase(value) : "";

  const totalIconCount = isSearching
    ? searchResults.length
    : MATERIAL_ICONS.length;

  return (
    <div className="space-y-2 min-w-0">
      {label && <label className="text-sm font-medium">{label}</label>}
      <div className="flex gap-2 min-w-0">
        <Button
          type="button"
          variant="outline"
          className="flex-1 min-w-0 justify-start overflow-hidden"
          onClick={() => setOpen(true)}
        >
          {displayValue ? (
            <div className="flex items-center gap-2 min-w-0">
              <MaterialIcon name={displayValue} size={20} />
              <span className="truncate">{displayValue}</span>
            </div>
          ) : (
            <span className="text-muted-foreground truncate">{t("iconSelector.selectPlaceholder")}</span>
          )}
        </Button>
        {value && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0"
            onClick={() => onChange("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{t("iconSelector.dialogTitle")}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("iconSelector.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                autoFocus
              />
            </div>

            <div className="text-sm text-muted-foreground">
              {t("iconSelector.iconsFound", { count: totalIconCount })}
            </div>

            <ScrollArea className="h-[450px] border rounded-md">
              {isSearching ? (
                // Flat grid for search results
                <div className="grid grid-cols-6 gap-2 p-4">
                  {searchResults.map((name) => (
                    <IconTile
                      key={name}
                      name={name}
                      onClick={() => handleSelectIcon(name)}
                    />
                  ))}
                </div>
              ) : (
                // Grouped view
                <div className="p-4 space-y-6">
                  {ICON_GROUPS.map((group) => (
                    <div key={group.label}>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-1">
                        {group.label}
                      </h3>
                      <div className="grid grid-cols-6 gap-2">
                        {group.icons.map((snakeName) => (
                          <IconTile
                            key={snakeName}
                            name={snakeName}
                            onClick={() => handleSelectIcon(snakeName)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
