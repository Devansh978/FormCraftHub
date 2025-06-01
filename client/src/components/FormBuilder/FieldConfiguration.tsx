import { FormField, FieldType } from '@/types/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

interface FieldConfigurationProps {
  selectedField: FormField | null;
  onUpdateField: (field: FormField) => void;
  onAddOption: () => void;
  onUpdateOption: (index: number, label: string) => void;
  onRemoveOption: (index: number) => void;
}

export function FieldConfiguration({
  selectedField,
  onUpdateField,
  onAddOption,
  onUpdateOption,
  onRemoveOption,
}: FieldConfigurationProps) {
  if (!selectedField) {
    return (
      <div className="w-80 bg-white border-l border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Field Settings</h2>
          <p className="text-sm text-muted-foreground mt-1">Configure the selected field</p>
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center text-muted-foreground">
            <i className="fas fa-mouse-pointer text-3xl mb-4"></i>
            <p className="text-sm">Select a field to edit its settings</p>
          </div>
        </div>
      </div>
    );
  }

  const handleFieldUpdate = (updates: Partial<FormField>) => {
    onUpdateField({ ...selectedField, ...updates });
  };

  const fieldTypes: { value: FieldType; label: string }[] = [
    { value: 'text', label: 'Text Input' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'textarea', label: 'Textarea' },
    { value: 'select', label: 'Dropdown' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'radio', label: 'Radio Button' },
    { value: 'date', label: 'Date Picker' },
    { value: 'file', label: 'File Upload' },
    { value: 'range', label: 'Range Slider' },
  ];

  const hasOptions = ['select', 'checkbox', 'radio'].includes(selectedField.type);

  return (
    <div className="w-80 bg-white border-l border-border flex flex-col">
      {/* Panel Header */}
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Field Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">Configure the selected field</p>
      </div>

      {/* Configuration Form */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Field Type */}
        <div>
          <Label className="text-sm font-medium text-foreground mb-2 block">Field Type</Label>
          <Select
            value={selectedField.type}
            onValueChange={(value: FieldType) => handleFieldUpdate({ type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fieldTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Field Label */}
        <div>
          <Label className="text-sm font-medium text-foreground mb-2 block">Label</Label>
          <Input
            value={selectedField.label}
            onChange={(e) => handleFieldUpdate({ label: e.target.value })}
            placeholder="Enter field label"
          />
        </div>

        {/* Placeholder */}
        <div>
          <Label className="text-sm font-medium text-foreground mb-2 block">Placeholder</Label>
          <Input
            value={selectedField.placeholder || ''}
            onChange={(e) => handleFieldUpdate({ placeholder: e.target.value })}
            placeholder="Enter placeholder text"
          />
        </div>

        {/* Help Text */}
        <div>
          <Label className="text-sm font-medium text-foreground mb-2 block">Help Text</Label>
          <Textarea
            rows={2}
            value={selectedField.helpText || ''}
            onChange={(e) => handleFieldUpdate({ helpText: e.target.value })}
            placeholder="Additional guidance for users..."
            className="resize-none"
          />
        </div>

        <Separator />

        {/* Validation Rules */}
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">Validation</h3>
          <div className="space-y-3">
            {/* Required */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="required"
                checked={selectedField.required}
                onCheckedChange={(checked) => handleFieldUpdate({ required: !!checked })}
              />
              <Label htmlFor="required" className="text-sm text-foreground">Required field</Label>
            </div>

            {/* Min/Max Length */}
            {['text', 'email', 'phone', 'textarea'].includes(selectedField.type) && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground mb-1 block">Min Length</Label>
                  <Input
                    type="number"
                    value={selectedField.validation?.minLength || ''}
                    onChange={(e) => handleFieldUpdate({
                      validation: {
                        ...selectedField.validation,
                        minLength: e.target.value ? parseInt(e.target.value) : undefined,
                      }
                    })}
                    placeholder="0"
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground mb-1 block">Max Length</Label>
                  <Input
                    type="number"
                    value={selectedField.validation?.maxLength || ''}
                    onChange={(e) => handleFieldUpdate({
                      validation: {
                        ...selectedField.validation,
                        maxLength: e.target.value ? parseInt(e.target.value) : undefined,
                      }
                    })}
                    placeholder="100"
                    className="text-sm"
                  />
                </div>
              </div>
            )}

            {/* Pattern Validation */}
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1 block">Pattern</Label>
              <Select
                value={selectedField.validation?.pattern || 'none'}
                onValueChange={(value) => handleFieldUpdate({
                  validation: {
                    ...selectedField.validation,
                    pattern: value === 'none' ? undefined : value,
                  }
                })}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="No pattern" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No pattern</SelectItem>
                  <SelectItem value="email">Email format</SelectItem>
                  <SelectItem value="phone">Phone number</SelectItem>
                  <SelectItem value="url">Website URL</SelectItem>
                  <SelectItem value="custom">Custom regex</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Options (for select/radio/checkbox) */}
        {hasOptions && (
          <>
            <Separator />
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">Options</h3>
              <div className="space-y-2">
                {selectedField.options?.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={option.label}
                      onChange={(e) => onUpdateOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1 text-sm"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onRemoveOption(index)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <i className="fas fa-times text-xs"></i>
                    </Button>
                  </div>
                )) || []}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={onAddOption}
                  className="w-full text-primary border-primary border-dashed hover:bg-primary hover:text-white"
                >
                  <i className="fas fa-plus mr-1"></i>Add Option
                </Button>
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* Advanced Settings */}
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">Advanced</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hidden"
                checked={selectedField.hidden || false}
                onCheckedChange={(checked) => handleFieldUpdate({ hidden: !!checked })}
              />
              <Label htmlFor="hidden" className="text-sm text-foreground">Hidden field</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="readonly"
                checked={selectedField.readonly || false}
                onCheckedChange={(checked) => handleFieldUpdate({ readonly: !!checked })}
              />
              <Label htmlFor="readonly" className="text-sm text-foreground">Read only</Label>
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1 block">CSS Class</Label>
              <Input
                value={selectedField.cssClass || ''}
                onChange={(e) => handleFieldUpdate({ cssClass: e.target.value })}
                placeholder="custom-class"
                className="text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}