"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export function SortableItem({ id, children, className }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : undefined,
  };
  return (
    <div ref={setNodeRef} style={style} className={`flex items-center gap-2 ${className ?? ""}`}>
      <button
        {...attributes}
        {...listeners}
        type="button"
        aria-label="Drag to reorder"
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring flex-shrink-0"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      {children}
    </div>
  );
}
