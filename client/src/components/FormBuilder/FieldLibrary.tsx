import { DraggableField } from './DraggableField';
import { FieldLibraryItem } from '@/types/form';
import { Button } from '@/components/ui/button';
import { formTemplates } from '@/lib/formTemplates';

interface FieldLibraryProps {
  onDragStart: (type: string) => void;
  onLoadTemplate: (templateKey: string) => void;
}

const fieldLibrary: FieldLibraryItem[] = [
  // Basic Fields
  { type: 'text', label: 'Text Input', description: 'Single line text', icon: 'fas fa-font', category: 'basic' },
  { type: 'textarea', label: 'Textarea', description: 'Multi-line text', icon: 'fas fa-align-left', category: 'basic' },
  { type: 'email', label: 'Email', description: 'Email validation', icon: 'fas fa-envelope', category: 'basic' },
  { type: 'phone', label: 'Phone', description: 'Phone validation', icon: 'fas fa-phone', category: 'basic' },
  
  // Choice Fields
  { type: 'select', label: 'Dropdown', description: 'Select options', icon: 'fas fa-chevron-down', category: 'choice' },
  { type: 'checkbox', label: 'Checkbox', description: 'Multiple choice', icon: 'fas fa-check-square', category: 'choice' },
  { type: 'radio', label: 'Radio Button', description: 'Single choice', icon: 'fas fa-dot-circle', category: 'choice' },
  
  // Advanced Fields
  { type: 'date', label: 'Date Picker', description: 'Date selection', icon: 'fas fa-calendar', category: 'advanced' },
  { type: 'file', label: 'File Upload', description: 'File attachment', icon: 'fas fa-upload', category: 'advanced' },
  { type: 'range', label: 'Range Slider', description: 'Numeric range', icon: 'fas fa-sliders-h', category: 'advanced' },
];

export function FieldLibrary({ onDragStart, onLoadTemplate }: FieldLibraryProps) {
  const groupedFields = fieldLibrary.reduce((acc, field) => {
    if (!acc[field.category]) {
      acc[field.category] = [];
    }
    acc[field.category].push(field);
    return acc;
  }, {} as Record<string, FieldLibraryItem[]>);

  const categoryTitles = {
    basic: 'Basic Fields',
    choice: 'Choice Fields',
    advanced: 'Advanced Fields',
  };

  return (
    <div className="w-80 bg-white border-r border-border flex flex-col">
      {/* Sidebar Header */}
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground mb-2">Form Elements</h2>
        <p className="text-sm text-muted-foreground">Drag elements to add them to your form</p>
      </div>
      
      {/* Field Categories */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {Object.entries(groupedFields).map(([category, fields]) => (
          <div key={category}>
            <h3 className="text-sm font-medium text-foreground mb-3">
              {categoryTitles[category as keyof typeof categoryTitles]}
            </h3>
            <div className="space-y-2">
              {fields.map((field) => (
                <DraggableField
                  key={field.type}
                  field={field}
                  onDragStart={onDragStart}
                />
              ))}
            </div>
          </div>
        ))}
        
        {/* Templates */}
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">Templates</h3>
          <div className="space-y-2">
            <Button
              onClick={() => onLoadTemplate('contact')}
              className="w-full justify-start gradient-primary text-white hover:opacity-90"
              size="sm"
            >
              <i className="fas fa-phone mr-2"></i>Contact Us Form
            </Button>
            <Button
              onClick={() => onLoadTemplate('registration')}
              className="w-full justify-start gradient-secondary text-white hover:opacity-90"
              size="sm"
            >
              <i className="fas fa-user-plus mr-2"></i>Registration Form
            </Button>
            <Button
              onClick={() => onLoadTemplate('survey')}
              className="w-full justify-start gradient-accent text-white hover:opacity-90"
              size="sm"
            >
              <i className="fas fa-poll mr-2"></i>Survey Template
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
