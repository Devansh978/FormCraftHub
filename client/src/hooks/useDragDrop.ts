import { useState, useCallback } from 'react';
import { FieldType } from '@/types/form';

export interface DragItem {
  type: FieldType;
  id?: string;
}

export function useDragDrop() {
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null);

  const handleDragStart = useCallback((item: DragItem) => {
    setDraggedItem(item);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
    setDragOverTarget(null);
  }, []);

  const handleDragOver = useCallback((targetId: string) => {
    setDragOverTarget(targetId);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverTarget(null);
  }, []);

  return {
    draggedItem,
    dragOverTarget,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
  };
}
