import { useState } from 'react';
import { useParams } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Form, FormField } from '@/types/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function FormFillerPage() {
  const { publicId } = useParams<{ publicId: string }>();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const { data: form, isLoading, error } = useQuery<Form>({
    queryKey: ['/api/forms/public', publicId],
    enabled: !!publicId,
  });

  const submitMutation = useMutation({
    mutationFn: async (data: { data: Record<string, any>; isComplete: boolean }) => {
      const response = await apiRequest('POST', `/api/public/${publicId}/submit`, data);
      return response.json();
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({ title: 'Form submitted successfully!' });
    },
    onError: (error) => {
      console.error('Submit error:', error);
      toast({ title: 'Failed to submit form', variant: 'destructive' });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-3xl text-primary mb-4"></i>
          <p className="text-muted-foreground">Loading form...</p>
        </div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <i className="fas fa-exclamation-triangle text-3xl text-destructive mb-4"></i>
            <h1 className="text-xl font-semibold text-foreground mb-2">Form Not Found</h1>
            <p className="text-muted-foreground">
              The form you're looking for doesn't exist or has been removed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-check text-2xl text-success"></i>
            </div>
            <h1 className="text-xl font-semibold text-foreground mb-2">Thank You!</h1>
            <p className="text-muted-foreground">
              {form.settings.submitMessage || 'Your response has been submitted successfully.'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentStepFields = form.fields.filter(field => field.stepId === currentStep);
  const currentStepData = form.steps.find(step => step.id === currentStep);
  const progress = ((currentStep - 1) / (form.steps.length - 1)) * 100;
  const isLastStep = currentStep === form.steps.length;

  const renderField = (field: FormField) => {
    const value = formData[field.id] || '';
    const updateValue = (newValue: any) => {
      setFormData(prev => ({ ...prev, [field.id]: newValue }));
    };

    const commonProps = {
      placeholder: field.placeholder,
      required: field.required,
      className: `w-full ${field.cssClass || ''}`,
      disabled: field.readonly,
      value,
      onChange: (e: any) => updateValue(e.target.value),
    };

    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
        return <Input type={field.type} {...commonProps} />;
      
      case 'textarea':
        return <Textarea rows={4} {...commonProps} className={`${commonProps.className} resize-none`} />;
      
      case 'select':
        return (
          <Select value={value} onValueChange={updateValue}>
            <SelectTrigger>
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
      
      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`${field.id}-${option.value}`}
                  checked={(value || []).includes(option.value)}
                  onCheckedChange={(checked) => {
                    const currentValues = value || [];
                    if (checked) {
                      updateValue([...currentValues, option.value]);
                    } else {
                      updateValue(currentValues.filter((v: string) => v !== option.value));
                    }
                  }}
                />
                <Label htmlFor={`${field.id}-${option.value}`}>{option.label}</Label>
              </div>
            ))}
          </div>
        );
      
      case 'radio':
        return (
          <RadioGroup value={value} onValueChange={updateValue}>
            {field.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${field.id}-${option.value}`} />
                <Label htmlFor={`${field.id}-${option.value}`}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      
      case 'date':
        return <Input type="date" {...commonProps} />;
      
      case 'file':
        return <Input type="file" {...commonProps} />;
      
      case 'range':
        return <Input type="range" {...commonProps} />;
      
      default:
        return <Input {...commonProps} />;
    }
  };

  const validateCurrentStep = () => {
    const requiredFields = currentStepFields.filter(field => field.required);
    return requiredFields.every(field => {
      const value = formData[field.id];
      if (field.type === 'checkbox') {
        return value && value.length > 0;
      }
      return value && value.toString().trim() !== '';
    });
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => prev + 1);
    } else {
      toast({ title: 'Please fill in all required fields', variant: 'destructive' });
    }
  };

  const handleSubmit = () => {
    if (validateCurrentStep()) {
      submitMutation.mutate({
        data: formData,
        isComplete: true,
      });
    } else {
      toast({ title: 'Please fill in all required fields', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Form Header */}
        <Card className="mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-foreground">{form.title}</CardTitle>
            {form.description && (
              <p className="text-muted-foreground mt-2">{form.description}</p>
            )}
          </CardHeader>
        </Card>

        {/* Progress Indicator */}
        {form.steps.length > 1 && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-foreground">
                  {currentStepData?.title || `Step ${currentStep}`}
                </div>
                <div className="text-sm text-muted-foreground">
                  {currentStep} of {form.steps.length}
                </div>
              </div>
              <Progress value={progress} className="h-2" />
            </CardContent>
          </Card>
        )}

        {/* Form Fields */}
        <div className="space-y-4">
          {currentStepFields
            .sort((a, b) => a.order - b.order)
            .map((field) => {
              if (field.hidden) return null;
              
              return (
                <Card key={field.id}>
                  <CardContent className="pt-6">
                    <Label className="block text-sm font-medium text-foreground mb-2">
                      {field.label}
                      {field.required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    {renderField(field)}
                    {field.helpText && (
                      <p className="mt-1 text-xs text-muted-foreground">{field.helpText}</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
        </div>

        {/* Navigation */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                disabled={currentStep === 1}
                onClick={() => setCurrentStep(prev => prev - 1)}
              >
                <i className="fas fa-arrow-left mr-2"></i>Previous
              </Button>
              
              {isLastStep ? (
                <Button
                  onClick={handleSubmit}
                  disabled={submitMutation.isPending}
                  className="bg-success hover:bg-success/90"
                >
                  {submitMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>Submitting...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane mr-2"></i>Submit
                    </>
                  )}
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  Next Step<i className="fas fa-arrow-right ml-2"></i>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
