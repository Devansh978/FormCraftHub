import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface FormFieldProps {
  field: {
    id: string;
    type: string;
    label?: string;
    placeholder?: string;
    required?: boolean;
    readonly?: boolean;
    hidden?: boolean;
    cssClass?: string;
    helpText?: string;
    options?: Array<{ value: string; label: string }>;
    validation?: {
      min?: number;
      max?: number;
      step?: number;
    };
  };
  value?: any;
  onChange?: (value: any) => void;
  isSelected?: boolean;
  onSelect?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onConfigure?: () => void;
  isPreview?: boolean;
}

export function FormField({
  field,
  value,
  onChange,
  isSelected = false,
  onSelect = () => {},
  onDelete = () => {},
  onDuplicate = () => {},
  onConfigure = () => {},
  isPreview = false,
}: FormFieldProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (onChange) onChange(e.target.value);
  };

  const handleSelectChange = (val: string) => {
    if (onChange) onChange(val);
  };

  const handleCheckboxChange = (optionValue: string, checked: boolean) => {
    const currentValues = Array.isArray(value) ? [...value] : [];
    if (checked) {
      onChange?.([...currentValues, optionValue]);
    } else {
      onChange?.(currentValues.filter(v => v !== optionValue));
    }
  };

  const handleSingleCheckboxChange = (checked: boolean) => {
    onChange?.(checked);
  };

  const handleSliderChange = (values: number[]) => {
    onChange?.(values[0]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.files);
  };

  const renderFieldInput = () => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'number':
      case 'date':
        return (
          <Input
            type={field.type}
            value={value ?? ''}
            onChange={handleInputChange}
            placeholder={field.placeholder}
            required={field.required}
            disabled={field.readonly}
            className={`w-full ${field.cssClass || ''}`}
          />
        );

      case 'textarea':
        return (
          <Textarea
            value={value ?? ''}
            onChange={handleInputChange}
            placeholder={field.placeholder}
            required={field.required}
            disabled={field.readonly}
            className={`w-full ${field.cssClass || ''}`}
          />
        );

      case 'select':
        return (
          <Select
            value={value ?? ''}
            onValueChange={handleSelectChange}
            disabled={field.readonly}
          >
            <SelectTrigger className={`w-full ${field.cssClass || ''}`}>
              <SelectValue placeholder={field.placeholder || 'Select an option'} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'radio':
        return (
          <RadioGroup
            value={value ?? ''}
            onValueChange={handleSelectChange}
            disabled={field.readonly}
            className="space-y-2"
          >
            {field.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${field.id}-${option.value}`} />
                <Label htmlFor={`${field.id}-${option.value}`}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'checkbox':
        if (field.options) {
          return (
            <div className="space-y-2">
              {field.options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field.id}-${option.value}`}
                    checked={Array.isArray(value) ? value.includes(option.value) : false}
                    onCheckedChange={(checked) => handleCheckboxChange(option.value, !!checked)}
                    disabled={field.readonly}
                  />
                  <Label htmlFor={`${field.id}-${option.value}`}>{option.label}</Label>
                </div>
              ))}
            </div>
          );
        } else {
          return (
            <div className="flex items-center space-x-2">
              <Checkbox
                id={field.id}
                checked={!!value}
                onCheckedChange={handleSingleCheckboxChange}
                disabled={field.readonly}
              />
              {field.label && <Label htmlFor={field.id}>{field.label}</Label>}
            </div>
          );
        }

      case 'range':
        return (
          <div className="space-y-2">
            <Slider
              value={[value ?? field.validation?.min ?? 0]}
              onValueChange={handleSliderChange}
              min={field.validation?.min ?? 0}
              max={field.validation?.max ?? 100}
              step={field.validation?.step ?? 1}
              className="w-full"
              disabled={field.readonly}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{field.validation?.min ?? 0}</span>
              <span>{value ?? field.validation?.min ?? 0}</span>
              <span>{field.validation?.max ?? 100}</span>
            </div>
          </div>
        );

      case 'file':
        return (
          <Input
            type="file"
            onChange={handleFileChange}
            placeholder={field.placeholder}
            required={field.required}
            disabled={field.readonly}
            className={`w-full ${field.cssClass || ''}`}
          />
        );

      default:
        return (
          <Input
            type="text"
            value={value ?? ''}
            onChange={handleInputChange}
            placeholder={field.placeholder}
            required={field.required}
            disabled={field.readonly}
            className={`w-full ${field.cssClass || ''}`}
          />
        );
    }
  };

  if (field.hidden) return null;

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-border p-6 transition-all ${
        isPreview
          ? 'hover:shadow-sm'
          : `cursor-pointer hover:shadow-md ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}`
      }`}
      onClick={isPreview ? undefined : onSelect}
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {field.type !== 'checkbox' && (
              <Label className="block text-sm font-medium text-foreground mb-2">
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </Label>
            )}
            {renderFieldInput()}
            {field.helpText && (
              <p className="mt-1 text-xs text-muted-foreground">{field.helpText}</p>
            )}
          </div>

          {!isPreview && (
            <div className="flex items-center space-x-1 ml-4">
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onConfigure();
                }}
                className="h-8 w-8 p-0 hover:bg-primary/10"
              >
                <i className="fas fa-cog text-xs"></i>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate();
                }}
                className="h-8 w-8 p-0 hover:bg-primary/10"
              >
                <i className="fas fa-copy text-xs"></i>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="h-8 w-8 p-0 hover:bg-destructive/10 text-destructive"
              >
                <i className="fas fa-trash text-xs"></i>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}