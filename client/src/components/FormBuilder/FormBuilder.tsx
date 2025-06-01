import { useState, useCallback } from 'react';
import { FormField, Form, FormStep, PreviewMode } from '@/types/form';
import { FieldLibrary } from './FieldLibrary';
import { FormCanvas } from './FormCanvas';
import { FieldConfiguration } from './FieldConfiguration';
import { FormBuilderHeader } from './FormBuilderHeader';
import { Button } from '@/components/ui/button'; 
import { useToast } from '@/hooks/use-toast';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { formTemplates } from '@/lib/formTemplates';
import { nanoid } from 'nanoid';
import { ShareFormModal } from '@/components/modals/ShareFormModal';
import { PreviewModal } from '@/components/modals/PreviewModal';
import { ResponsesModal } from '@/components/modals/ResponsesModal';

export function FormBuilder() {
  const initialForm: Form = {
    title: 'Untitled Form',
    description: '',
    fields: [],
    steps: [{ id: 1, title: 'Step 1', order: 1 }],
    settings: {
      allowAnonymous: true,
      requireAuth: false,
      emailNotifications: true,
    },
    isPublished: false,
  };

  const {
    state: form,
    set: setForm,
    undo,
    redo,
    canUndo,
    canRedo,
    reset: resetForm,
  } = useUndoRedo<Form>(initialForm);

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');
  const [isDragOver, setIsDragOver] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showResponsesModal, setShowResponsesModal] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const saveFormMutation = useMutation({
    mutationFn: async (formData: Omit<Form, 'id' | 'publicId' | 'createdAt' | 'updatedAt'>) => {
      if (form.id) {
        return apiRequest('PUT', `/api/forms/${form.id}`, formData);
      } else {
        return apiRequest('POST', '/api/forms', formData);
      }
    },
    onSuccess: async (response) => {
      const savedForm = await response.json();
      setForm(savedForm);
      toast({ title: 'Form saved successfully!' });
      queryClient.invalidateQueries({ queryKey: ['/api/forms'] });
    },
    onError: () => {
      toast({ title: 'Failed to save form', variant: 'destructive' });
    },
  });

  const selectedField = form.fields.find(field => field.id === selectedFieldId) || null;

  const handleDragStart = useCallback((fieldType: string) => {
    // Drag start handled by individual draggable components
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const fieldType = e.dataTransfer.getData('text/plain');
    if (!fieldType) return;

    const newField: FormField = {
      id: nanoid(),
      type: fieldType as any,
      label: `New ${fieldType} field`,
      placeholder: '',
      helpText: '',
      required: false,
      stepId: currentStep,
      order: form.fields.filter(f => f.stepId === currentStep).length + 1,
    };

    if (['select', 'checkbox', 'radio'].includes(fieldType)) {
      newField.options = [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' },
      ];
    }

    setForm({
      ...form,
      fields: [...form.fields, newField],
    });

    setSelectedFieldId(newField.id);
  }, [currentStep, form, setForm]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFieldUpdate = useCallback((updatedField: FormField) => {
    setForm({
      ...form,
      fields: form.fields.map(field =>
        field.id === updatedField.id ? updatedField : field
      ),
    });
  }, [form, setForm]);

  const handleFieldDelete = useCallback((fieldId: string) => {
    setForm({
      ...form,
      fields: form.fields.filter(field => field.id !== fieldId),
    });
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(null);
    }
  }, [form, setForm, selectedFieldId]);

  const handleFieldDuplicate = useCallback((fieldId: string) => {
    const fieldToDuplicate = form.fields.find(field => field.id === fieldId);
    if (!fieldToDuplicate) return;

    const duplicatedField: FormField = {
      ...fieldToDuplicate,
      id: nanoid(),
      label: `${fieldToDuplicate.label} (Copy)`,
      order: fieldToDuplicate.order + 1,
    };

    setForm({
      ...form,
      fields: [
        ...form.fields.map(field =>
          field.stepId === fieldToDuplicate.stepId && field.order > fieldToDuplicate.order
            ? { ...field, order: field.order + 1 }
            : field
        ),
        duplicatedField,
      ],
    });
  }, [form, setForm]);

  const handleAddStep = useCallback(() => {
    const newStepId = Math.max(...form.steps.map(s => s.id)) + 1;
    const newStep: FormStep = {
      id: newStepId,
      title: `Step ${newStepId}`,
      order: form.steps.length + 1,
    };

    setForm({
      ...form,
      steps: [...form.steps, newStep],
    });
  }, [form, setForm]);

  const handleLoadTemplate = useCallback((templateKey: string) => {
    const template = formTemplates[templateKey];
    if (!template) return;

    setForm({
      ...template,
      id: form.id,
      publicId: form.publicId,
      createdAt: form.createdAt,
      updatedAt: form.updatedAt,
    });

    setCurrentStep(1);
    setSelectedFieldId(null);
    toast({ title: `${template.title} template loaded!` });
  }, [form.id, form.publicId, form.createdAt, form.updatedAt]);

  const handleAddOption = useCallback(() => {
    if (!selectedField) return;

    const newOption = {
      label: `Option ${(selectedField.options?.length || 0) + 1}`,
      value: `option${(selectedField.options?.length || 0) + 1}`,
    };

    handleFieldUpdate({
      ...selectedField,
      options: [...(selectedField.options || []), newOption],
    });
  }, [selectedField, handleFieldUpdate]);

  const handleUpdateOption = useCallback((index: number, label: string) => {
    if (!selectedField || !selectedField.options) return;

    const updatedOptions = [...selectedField.options];
    updatedOptions[index] = {
      ...updatedOptions[index],
      label,
      value: label.toLowerCase().replace(/\s+/g, '_'),
    };

    handleFieldUpdate({
      ...selectedField,
      options: updatedOptions,
    });
  }, [selectedField, handleFieldUpdate]);

  const handleRemoveOption = useCallback((index: number) => {
    if (!selectedField || !selectedField.options) return;

    handleFieldUpdate({
      ...selectedField,
      options: selectedField.options.filter((_, i) => i !== index),
    });
  }, [selectedField, handleFieldUpdate]);

  // Auto-save functionality
  useAutoSave({
    form,
    onSave: () => {
      if (form.id) {
        saveFormMutation.mutate(form);
      }
    },
    interval: 10000, // Auto-save every 10 seconds
    enabled: !!form.id, // Only auto-save existing forms
  });

  const handleSaveForm = () => {
    saveFormMutation.mutate(form);
  };

  const handleTitleChange = useCallback((title: string) => {
    setForm({ ...form, title });
  }, [form, setForm]);

  const handleDescriptionChange = useCallback((description: string) => {
    setForm({ ...form, description });
  }, [form, setForm]);

  const handleReorderFields = useCallback((dragIndex: number, hoverIndex: number) => {
    const currentStepFields = form.fields.filter(f => f.stepId === currentStep);
    const sortedFields = currentStepFields.sort((a, b) => a.order - b.order);

    const draggedField = sortedFields[dragIndex];
    const hoveredField = sortedFields[hoverIndex];

    if (!draggedField || !hoveredField) return;

    const updatedFields = form.fields.map(field => {
      if (field.stepId !== currentStep) return field;

      if (field.id === draggedField.id) {
        return { ...field, order: hoveredField.order };
      } else if (field.id === hoveredField.id) {
        return { ...field, order: draggedField.order };
      }
      return field;
    });

    setForm({ ...form, fields: updatedFields });
  }, [form, setForm, currentStep]);

  return (
    <div className="h-screen flex flex-col">
      {/* Top Navigation */}
      <FormBuilderHeader
        form={form}
        previewMode={previewMode}
        onPreviewModeChange={setPreviewMode}
        onSave={handleSaveForm}
        onPreview={() => setShowPreviewModal(true)}
        onShare={() => setShowShareModal(true)}
        onViewResponses={() => setShowResponsesModal(true)}
        isSaving={saveFormMutation.isPending}
        onTitleChange={handleTitleChange}
        onDescriptionChange={handleDescriptionChange}
      />

      {/* Main Content */}
      <div className="flex h-full">
        <FieldLibrary
          onDragStart={handleDragStart}
          onLoadTemplate={handleLoadTemplate}
        />

        <FormCanvas
          title={form.title}
          description={form.description}
          fields={form.fields}
          steps={form.steps}
          currentStep={currentStep}
          selectedFieldId={selectedFieldId}
          onFieldSelect={setSelectedFieldId}
          onFieldDelete={handleFieldDelete}
          onFieldDuplicate={handleFieldDuplicate}
          onFieldConfigure={setSelectedFieldId}
          onStepChange={setCurrentStep}
          onAddStep={handleAddStep}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onReorderFields={handleReorderFields}
          isDragOver={isDragOver}
        />

        <FieldConfiguration
          selectedField={selectedField}
          onUpdateField={handleFieldUpdate}
          onAddOption={handleAddOption}
          onUpdateOption={handleUpdateOption}
          onRemoveOption={handleRemoveOption}
        />
      </div>

      {/* Modals */}
      <ShareFormModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        form={form}
        onSave={(updatedForm) => setForm(updatedForm)}
      />

      <PreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        form={form}
        previewMode={previewMode}
        onPreviewModeChange={setPreviewMode}
      />

      <ResponsesModal
        isOpen={showResponsesModal}
        onClose={() => setShowResponsesModal(false)}
        formId={form.id}
      />
    </div>
  );
}