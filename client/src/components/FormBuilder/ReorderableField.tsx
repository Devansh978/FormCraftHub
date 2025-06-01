import { FormField as FormFieldType } from '@/types/form';
import { FormField } from './FormField';

interface ReorderableFieldProps {
  field: FormFieldType;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onConfigure: () => void;
  onReorder: (dragIndex: number, hoverIndex: number) => void;
}

export function ReorderableField({
  field,
  index,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
  onConfigure,
  onReorder,
}: ReorderableFieldProps) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/field-reorder', JSON.stringify({ index, fieldId: field.id }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dragData = e.dataTransfer.getData('application/field-reorder');
    
    if (dragData) {
      const { index: dragIndex } = JSON.parse(dragData);
      if (dragIndex !== index) {
        onReorder(dragIndex, index);
      }
    }
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`transition-all duration-200 ${isSelected ? 'ring-2 ring-primary' : ''}`}
    >
      <FormField
        field={field}
        isSelected={isSelected}
        onSelect={onSelect}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        onConfigure={onConfigure}
      />
    </div>
  );
}