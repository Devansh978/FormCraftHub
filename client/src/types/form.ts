export type FieldType = 'text' | 'email' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'phone' | 'file' | 'range';

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
  options?: { label: string; value: string }[];
  stepId: number;
  order: number;
  cssClass?: string;
  hidden?: boolean;
  readonly?: boolean;
}

export interface FormStep {
  id: number;
  title: string;
  description?: string;
  order: number;
}

export interface FormSettings {
  allowAnonymous: boolean;
  requireAuth: boolean;
  emailNotifications: boolean;
  redirectUrl?: string;
  submitMessage?: string;
}

export interface Form {
  id?: number;
  publicId?: string;
  title: string;
  description?: string;
  fields: FormField[];
  steps: FormStep[];
  settings: FormSettings;
  isPublished: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FormResponse {
  id?: number;
  formId: number;
  data: Record<string, any>;
  isComplete: boolean;
  createdAt?: Date;
}

export type PreviewMode = 'desktop' | 'tablet' | 'mobile';

export interface FieldLibraryItem {
  type: FieldType;
  label: string;
  description: string;
  icon: string;
  category: 'basic' | 'choice' | 'advanced';
}
