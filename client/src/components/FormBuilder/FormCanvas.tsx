import { FormField as FormFieldType, FormStep } from '@/types/form';
import { ReorderableField } from './ReorderableField';
import { FormField } from './FormField';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface FormCanvasProps {
  title: string;
  description?: string;
  fields: FormFieldType[];
  steps: FormStep[];
  currentStep: number;
  selectedFieldId: string | null;
  onFieldSelect: (fieldId: string) => void;
  onFieldDelete: (fieldId: string) => void;
  onFieldDuplicate: (fieldId: string) => void;
  onFieldConfigure: (fieldId: string) => void;
  onStepChange: (stepId: number) => void;
  onAddStep: () => void;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onReorderFields: (dragIndex: number, hoverIndex: number) => void;
  isDragOver: boolean;
}

export function FormCanvas({
  title,
  description,
  fields,
  steps,
  currentStep,
  selectedFieldId,
  onFieldSelect,
  onFieldDelete,
  onFieldDuplicate,
  onFieldConfigure,
  onStepChange,
  onAddStep,
  onDrop,
  onDragOver,
  onDragLeave,
  onReorderFields,
  isDragOver,
}: FormCanvasProps) {
  const currentStepFields = fields.filter(field => field.stepId === currentStep);
  const currentStepData = steps.find(step => step.id === currentStep);
  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Canvas Toolbar */}
      <div className="bg-white border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-foreground">{title}</h1>
            <Badge variant="secondary">Draft</Badge>
          </div>

          {/* Multi-step Controls */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Steps:</span>
              <div className="flex items-center space-x-1">
                {steps.map((step) => (
                  <Button
                    key={step.id}
                    size="sm"
                    variant={step.id === currentStep ? "default" : "outline"}
                    onClick={() => onStepChange(step.id)}
                    className="h-8 w-8 p-0"
                  >
                    {step.id}
                  </Button>
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onAddStep}
                  className="h-8 w-8 p-0 text-primary border-primary hover:bg-primary hover:text-white"
                >
                  <i className="fas fa-plus text-xs"></i>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        {steps.length > 1 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-foreground">
                {currentStepData?.title || `Step ${currentStep}`}
              </div>
              <div className="text-sm text-muted-foreground">
                {currentStep} of {steps.length}
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
      </div>

      {/* Form Canvas */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto">
          {/* Form Header */}
          <div className="bg-white rounded-xl shadow-sm border border-border p-8 mb-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-3">{title}</h2>
              {description && (
                <p className="text-muted-foreground">{description}</p>
              )}
            </div>
          </div>

          {/* Form Fields Container */}
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            className={`space-y-4 min-h-96 ${isDragOver ? 'drag-over' : ''}`}
          >
            {currentStepFields.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <i className="fas fa-mouse-pointer text-3xl mb-4"></i>
                <p className="text-lg font-medium mb-2">Start building your form</p>
                <p className="text-sm">Drag fields from the sidebar to begin</p>
              </div>
            ) : (
              currentStepFields
                .sort((a, b) => a.order - b.order)
                .map((field, index) => (
                  <ReorderableField
                    key={field.id}
                    field={field}
                    index={index}
                    isSelected={selectedFieldId === field.id}
                    onSelect={() => onFieldSelect(field.id)}
                    onDelete={() => onFieldDelete(field.id)}
                    onDuplicate={() => onFieldDuplicate(field.id)}
                    onConfigure={() => onFieldConfigure(field.id)}
                    onReorder={onReorderFields}
                  >
                    <FormField
                      key={field.id}
                      field={field}
                      isSelected={selectedFieldId === field.id}
                      onSelect={() => onFieldSelect(field.id)}
                      onDelete={() => onFieldDelete(field.id)}
                      onDuplicate={() => onFieldDuplicate(field.id)}
                      onConfigure={() => onFieldSelect(field.id)}
                      isPreview={false}
                    />
                  </ReorderableField>
                ))
            )}

            {/* Drop Zone Indicator */}
            {isDragOver && (
              <div className="border-2 border-dashed border-primary bg-primary/5 rounded-xl p-8 text-center text-primary">
                <i className="fas fa-plus-circle text-2xl mb-2"></i>
                <p>Drop your field here</p>
              </div>
            )}
          </div>

          {/* Form Actions */}
          {steps.length > 1 && (
            <div className="bg-white rounded-xl shadow-sm border border-border p-6 mt-6">
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  disabled={currentStep === 1}
                  onClick={() => onStepChange(currentStep - 1)}
                >
                  <i className="fas fa-arrow-left mr-2"></i>Previous
                </Button>
                <Button
                  disabled={currentStep === steps.length}
                  onClick={() => onStepChange(currentStep + 1)}
                >
                  Next Step<i className="fas fa-arrow-right ml-2"></i>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}