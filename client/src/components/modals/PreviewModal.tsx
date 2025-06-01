import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Form, PreviewMode } from '@/types/form';
import { FormField } from '../FormBuilder/FormField';
import { useToast } from '@/hooks/use-toast';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: Form;
  previewMode: PreviewMode;
  onPreviewModeChange: (mode: PreviewMode) => void;
}

export function PreviewModal({ isOpen, onClose, form, previewMode, onPreviewModeChange }: PreviewModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const getPreviewWidth = () => {
    switch (previewMode) {
      case 'mobile':
        return 'max-w-sm';
      case 'tablet':
        return 'max-w-md';
      default:
        return 'max-w-2xl';
    }
  };

  const currentStepFields = form.fields.filter(field => field.stepId === currentStep);
  const currentStepData = form.steps.find(step => step.id === currentStep);
  const progress = form.steps.length > 1 ? ((currentStep - 1) / (form.steps.length - 1)) * 100 : 100;
  const isLastStep = currentStep === form.steps.length;

  const handleNext = () => {
    if (currentStep < form.steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const validateCurrentStep = () => {
    const requiredFields = currentStepFields.filter(field => field.required);
    const missingFields = requiredFields.filter(field => !formData[field.id] || formData[field.id] === '');
    return missingFields.length === 0;
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      toast({ title: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitted(true);
      toast({ title: 'Form submitted successfully!' });
    } catch (error) {
      toast({ title: 'Failed to submit form', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden">
        <DialogHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <DialogTitle className="text-xl font-bold">Form Preview</DialogTitle>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Live Preview
              </Badge>
            </div>
            <DialogDescription className="sr-only">
              Interactive preview of your form with live field validation and submission functionality
            </DialogDescription>
            <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
              {(['desktop', 'tablet', 'mobile'] as PreviewMode[]).map((mode) => (
                <Button
                  key={mode}
                  size="sm"
                  variant={previewMode === mode ? "default" : "ghost"}
                  onClick={() => onPreviewModeChange(mode)}
                  className="text-xs px-3 py-1"
                >
                  <i className={`fas fa-${mode === 'desktop' ? 'desktop' : mode === 'tablet' ? 'tablet-alt' : 'mobile-alt'} mr-2`}></i>
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto max-h-[calc(95vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
            {/* Steps Navigation - Left Sidebar */}
            {form.steps.length > 1 && (
              <div className="lg:col-span-3 order-2 lg:order-1">
                <div className="bg-gray-50 rounded-xl p-4 sticky top-0">
                  <h3 className="font-semibold text-sm text-gray-700 mb-4 flex items-center">
                    <i className="fas fa-list-ol mr-2"></i>
                    Form Steps
                  </h3>
                  <div className="space-y-2">
                    {form.steps.map((step, index) => (
                      <button
                        key={step.id}
                        onClick={() => setCurrentStep(step.id)}
                        className={`w-full text-left p-3 rounded-lg text-sm transition-all ${
                          currentStep === step.id
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'bg-white hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                            currentStep === step.id
                              ? 'bg-white text-primary'
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{step.title}</div>
                            {step.description && (
                              <div className="text-xs opacity-75 mt-1">{step.description}</div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Form Preview - Main Content */}
            <div className={`${form.steps.length > 1 ? 'lg:col-span-9' : 'lg:col-span-12'} order-1 lg:order-2`}>
              <div className={`mx-auto ${getPreviewWidth()} transition-all duration-300`}>
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  {/* Form Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
                    <div className="text-center">
                      <h2 className="text-2xl lg:text-3xl font-bold mb-3">{form.title}</h2>
                      {form.description && (
                        <p className="text-blue-100 text-lg">{form.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {form.steps.length > 1 && (
                    <div className="bg-gray-50 px-8 py-4 border-b border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium text-gray-700">
                          {currentStepData?.title || `Step ${currentStep}`}
                        </div>
                        <div className="text-sm text-gray-500">
                          {currentStep} of {form.steps.length}
                        </div>
                      </div>
                      <Progress value={progress} className="h-2 bg-gray-200" />
                    </div>
                  )}

                  {/* Form Fields */}
                  <div className="p-8">
                    {currentStepFields.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <i className="fas fa-clipboard-list text-4xl mb-4 text-gray-300"></i>
                        <p className="text-lg font-medium mb-2">No fields in this step</p>
                        <p className="text-sm">Add some fields to see them here</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {currentStepFields
                          .sort((a, b) => a.order - b.order)
                          .map((field) => (
                            <div key={field.id} className="bg-gray-50 rounded-xl p-6 border border-gray-100 hover:border-gray-200 transition-colors">
                              <FormField
                                field={field}
                                isSelected={false}
                                onSelect={() => {}}
                                onDelete={() => {}}
                                onDuplicate={() => {}}
                                onConfigure={() => {}}
                                value={formData[field.id]}
                                onChange={(value) => handleFieldChange(field.id, value)}
                                isPreview={true}
                              />
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Navigation Buttons */}
                  {form.steps.length > 1 && (
                    <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <Button
                          variant="outline"
                          onClick={handlePrevious}
                          disabled={currentStep === 1}
                          className="flex items-center space-x-2 hover:bg-gray-100"
                        >
                          <i className="fas fa-arrow-left"></i>
                          <span>Previous</span>
                        </Button>

                        {isLastStep ? (
                          <Button 
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg transform transition-all hover:scale-105"
                          >
                            {isSubmitting ? (
                              <i className="fas fa-spinner fa-spin"></i>
                            ) : (
                              <i className="fas fa-paper-plane"></i>
                            )}
                            <span>{isSubmitting ? 'Submitting...' : 'Submit Form'}</span>
                          </Button>
                        ) : (
                          <Button 
                            onClick={handleNext} 
                            disabled={!validateCurrentStep()}
                            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform transition-all hover:scale-105"
                          >
                            <span>Next</span>
                            <i className="fas fa-arrow-right"></i>
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Single Step Submit Button */}
                  {form.steps.length === 1 && (
                    <div className="px-8 pb-8">
                      <Button 
                        onClick={handleSubmit}
                        disabled={isSubmitting || !validateCurrentStep()}
                        className="w-full h-12 text-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform transition-all hover:scale-105"
                      >
                        {isSubmitting ? (
                          <>
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                            Submitting...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-paper-plane mr-2"></i>
                            Submit Form
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}