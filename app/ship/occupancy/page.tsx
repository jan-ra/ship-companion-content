"use client";

import { useState } from "react";
import { useAppDataStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { MultiLanguageTextarea } from "@/components/multi-language-textarea";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Bed, Edit2, X } from "lucide-react";
import { toast } from "sonner";
import type { Cabin, LanguageCode } from "@/lib/types";

export default function OccupancyPage() {
  const { data, updateData, getImageUrl, hasImage } = useAppDataStore();
  const [selectedCabinNr, setSelectedCabinNr] = useState<number | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deleteConfirmCabinNr, setDeleteConfirmCabinNr] = useState<number | null>(null);
  const [newCabin, setNewCabin] = useState({
    cabinNr: 1,
    posTop: 100,
    posLeft: 100,
    beds: 2,
  });

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No data loaded</p>
      </div>
    );
  }

  const cabins = data.data.cabins;
  const selectedCabin = selectedCabinNr !== null ? cabins.find((c) => c.cabinNr === selectedCabinNr) : null;

  // Get layout image URL
  const layoutImageUrl = getImageUrl("layout.png") || getImageUrl("layout");
  const hasLayoutImage = hasImage("layout.png") || hasImage("layout");

  // Calculate total beds
  const totalBeds = cabins.reduce((sum, c) => sum + c.beds, 0);

  // Get next available cabin number
  const getNextCabinNr = () => {
    if (cabins.length === 0) return 1;
    return Math.max(...cabins.map((c) => c.cabinNr)) + 1;
  };

  // Add new cabin
  const addCabin = () => {
    // Check if cabin number already exists
    if (cabins.some((c) => c.cabinNr === newCabin.cabinNr)) {
      toast.error(`Cabin ${newCabin.cabinNr} already exists`);
      return;
    }

    const cabin: Cabin = {
      cabinNr: newCabin.cabinNr,
      posTop: newCabin.posTop,
      posLeft: newCabin.posLeft,
      beds: newCabin.beds,
      occupants: [],
      translations: {
        de: { comment: "" },
        en: { comment: "" },
        nl: { comment: "" },
      },
    };

    updateData((d) => ({
      ...d,
      data: {
        ...d.data,
        cabins: [...d.data.cabins, cabin].sort((a, b) => a.cabinNr - b.cabinNr),
      },
    }));

    setIsAddDialogOpen(false);
    setSelectedCabinNr(newCabin.cabinNr);
    setNewCabin({ cabinNr: getNextCabinNr() + 1, posTop: 100, posLeft: 100, beds: 2 });
    toast.success(`Cabin ${cabin.cabinNr} added`);
  };

  // Delete cabin
  const deleteCabin = (cabinNr: number) => {
    updateData((d) => ({
      ...d,
      data: {
        ...d.data,
        cabins: d.data.cabins.filter((c) => c.cabinNr !== cabinNr),
      },
    }));

    if (selectedCabinNr === cabinNr) {
      setSelectedCabinNr(null);
    }
    setDeleteConfirmCabinNr(null);
    toast.success(`Cabin ${cabinNr} deleted`);
  };

  // Update cabin
  const updateCabin = (cabinNr: number, updates: Partial<Cabin>) => {
    // If updating cabin number, check for duplicates
    if (updates.cabinNr !== undefined && updates.cabinNr !== cabinNr) {
      if (cabins.some((c) => c.cabinNr === updates.cabinNr)) {
        toast.error(`Cabin ${updates.cabinNr} already exists`);
        return;
      }
      // Update selected cabin to the new number
      setSelectedCabinNr(updates.cabinNr);
    }

    updateData((d) => ({
      ...d,
      data: {
        ...d.data,
        cabins: d.data.cabins
          .map((c) => (c.cabinNr === cabinNr ? { ...c, ...updates } : c))
          .sort((a, b) => a.cabinNr - b.cabinNr),
      },
    }));
  };

  // Update cabin translation
  const updateCabinTranslation = (cabinNr: number, lang: LanguageCode, comment: string) => {
    updateData((d) => ({
      ...d,
      data: {
        ...d.data,
        cabins: d.data.cabins.map((c) =>
          c.cabinNr === cabinNr
            ? {
                ...c,
                translations: {
                  ...c.translations,
                  [lang]: { comment },
                },
              }
            : c
        ),
      },
    }));
  };

  return (
    <div className="p-6 max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Cabin Plan</h1>
          <p className="text-muted-foreground">
            {cabins.length} cabins · {totalBeds} beds
          </p>
        </div>
        <Button
          onClick={() => {
            setNewCabin({ ...newCabin, cabinNr: getNextCabinNr() });
            setIsAddDialogOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Cabin
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visual Layout */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ship Layout</CardTitle>
          </CardHeader>
          <CardContent>
            {hasLayoutImage && layoutImageUrl ? (
              <div className="flex justify-center">
                {/* Container matching Flutter's 250px fixed width approach */}
                <div
                  className="relative bg-muted rounded-lg overflow-visible"
                  style={{ width: 250 }}
                >
                  <img
                    src={layoutImageUrl}
                    alt="Ship layout"
                    style={{ width: 250 }}
                    className="h-auto"
                  />
                  {/* Cabin markers - positioned using pixel coordinates matching Flutter */}
                  {cabins.map((cabin) => {
                    const isSelected = selectedCabinNr === cabin.cabinNr;

                    return (
                      <button
                        key={cabin.cabinNr}
                        onClick={() => setSelectedCabinNr(cabin.cabinNr)}
                        className="absolute transition-transform hover:scale-110"
                        style={{
                          // Flutter uses top-left positioning, not centered
                          top: cabin.posTop,
                          left: cabin.posLeft,
                        }}
                        title={`Cabin ${cabin.cabinNr}: ${cabin.beds} beds`}
                      >
                        {/* Circle with cabin number */}
                        <div
                          className={`w-[42px] h-[42px] rounded-full flex items-center justify-center
                            text-sm font-bold shadow-lg bg-primary text-primary-foreground
                            ${isSelected ? "ring-2 ring-offset-2 ring-primary" : ""}`}
                        >
                          {cabin.cabinNr}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <p>No layout image found</p>
                <p className="text-sm">Upload &quot;layout.png&quot; to display the ship layout</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cabin Details / List */}
        <div className="space-y-4">
          {selectedCabin ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Bed className="h-5 w-5" />
                    Cabin {selectedCabin.cabinNr}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedCabinNr(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Cabin Settings */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Cabin Number</Label>
                    <Input
                      type="number"
                      min={1}
                      value={selectedCabin.cabinNr}
                      onChange={(e) => updateCabin(selectedCabin.cabinNr, { cabinNr: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Beds</Label>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={selectedCabin.beds}
                      onChange={(e) => updateCabin(selectedCabin.cabinNr, { beds: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Position Top</Label>
                    <Input
                      type="number"
                      value={selectedCabin.posTop}
                      onChange={(e) => updateCabin(selectedCabin.cabinNr, { posTop: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Position Left</Label>
                    <Input
                      type="number"
                      value={selectedCabin.posLeft}
                      onChange={(e) => updateCabin(selectedCabin.cabinNr, { posLeft: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <Separator />

                {/* Comments */}
                <MultiLanguageTextarea
                  label="Comment"
                  value={selectedCabin.translations || { de: { comment: "" }, en: { comment: "" }, nl: { comment: "" } }}
                  field="comment"
                  onChange={(lang, value) => updateCabinTranslation(selectedCabin.cabinNr, lang, value)}
                  placeholder="Add a note about this cabin..."
                  rows={2}
                />

                <div className="flex justify-end">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteConfirmCabinNr(selectedCabin.cabinNr)}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Cabin
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">All Cabins</CardTitle>
              </CardHeader>
              <CardContent>
                {cabins.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No cabins defined</p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setNewCabin({ ...newCabin, cabinNr: 1 });
                        setIsAddDialogOpen(true);
                      }}
                      className="mt-4 gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add First Cabin
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {cabins.map((cabin) => (
                      <button
                        key={cabin.cabinNr}
                        onClick={() => setSelectedCabinNr(cabin.cabinNr)}
                        className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                            {cabin.cabinNr}
                          </div>
                          <div>
                            <div className="font-medium">Cabin {cabin.cabinNr}</div>
                            <div className="text-sm text-muted-foreground">
                              {cabin.beds} beds · Position: ({cabin.posLeft}, {cabin.posTop})
                            </div>
                          </div>
                        </div>
                        <Edit2 className="h-4 w-4 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Add Cabin Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Cabin</DialogTitle>
            <DialogDescription>Create a new cabin with its position on the layout.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cabinNr">Cabin Number</Label>
                <Input
                  id="cabinNr"
                  type="number"
                  min={1}
                  value={newCabin.cabinNr}
                  onChange={(e) => setNewCabin({ ...newCabin, cabinNr: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="beds">Number of Beds</Label>
                <Input
                  id="beds"
                  type="number"
                  min={1}
                  max={10}
                  value={newCabin.beds}
                  onChange={(e) => setNewCabin({ ...newCabin, beds: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="posTop">Position Top</Label>
                <Input
                  id="posTop"
                  type="number"
                  value={newCabin.posTop}
                  onChange={(e) => setNewCabin({ ...newCabin, posTop: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="posLeft">Position Left</Label>
                <Input
                  id="posLeft"
                  type="number"
                  value={newCabin.posLeft}
                  onChange={(e) => setNewCabin({ ...newCabin, posLeft: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addCabin}>Add Cabin</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmCabinNr !== null} onOpenChange={() => setDeleteConfirmCabinNr(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Cabin {deleteConfirmCabinNr}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this cabin and remove all occupant assignments. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmCabinNr !== null && deleteCabin(deleteConfirmCabinNr)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Cabin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
