import { FieldLibraryItem } from '@/types/form';

interface DraggableFieldProps {
  field: FieldLibraryItem;
  onDragStart: (type: string) => void;
}

export function DraggableField({ field, onDragStart }: DraggableFieldProps) {
  const handleDragStart = (e: React.DragEvent) => {
    onDragStart(field.type);
    e.dataTransfer.setData('text/plain', field.type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'basic':
        return 'bg-primary/10 text-primary';
      case 'choice':
        return 'bg-secondary/10 text-secondary';
      case 'advanced':
        return 'bg-accent/10 text-accent';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="p-3 bg-gray-50 border border-border rounded-lg cursor-grab hover:bg-gray-100 hover:border-primary transition-all duration-200 select-none"
    >
      <div className="flex items-center space-x-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getCategoryColor(field.category)}`}>
          <i className={`${field.icon} text-sm`}></i>
        </div>
        <div>
          <div className="text-sm font-medium text-foreground">{field.label}</div>
          <div className="text-xs text-muted-foreground">{field.description}</div>
        </div>
      </div>
    </div>
  );
}
