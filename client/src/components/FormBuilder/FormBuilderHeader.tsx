import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Form, PreviewMode } from '@/types/form';

interface FormBuilderHeaderProps {
  form: Form;
  previewMode: PreviewMode;
  onPreviewModeChange: (mode: PreviewMode) => void;
  onSave: () => void;
  onPreview: () => void;
  onShare: () => void;
  onViewResponses: () => void;
  isSaving: boolean;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
}

export function FormBuilderHeader({
  form,
  previewMode,
  onPreviewModeChange,
  onSave,
  onPreview,
  onShare,
  onViewResponses,
  isSaving,
  onTitleChange,
  onDescriptionChange,
}: FormBuilderHeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);

  return (
    <nav className="bg-white border-b border-border shadow-sm sticky top-0 z-40">
      <div className="max-w-full mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                <i className="fas fa-edit text-white text-sm"></i>
              </div>
              <span className="text-xl font-semibold text-foreground">FormCraft</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-2">
              <div className="flex flex-col">
                {isEditingTitle ? (
                  <Input
                    value={form.title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    onBlur={() => setIsEditingTitle(false)}
                    onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                    className="h-8 text-sm font-medium"
                    autoFocus
                  />
                ) : (
                  <button
                    onClick={() => setIsEditingTitle(true)}
                    className="text-sm font-medium text-foreground hover:text-primary text-left"
                  >
                    {form.title}
                  </button>
                )}
                
                {isEditingDescription ? (
                  <Input
                    value={form.description || ''}
                    onChange={(e) => onDescriptionChange(e.target.value)}
                    onBlur={() => setIsEditingDescription(false)}
                    onKeyDown={(e) => e.key === 'Enter' && setIsEditingDescription(false)}
                    placeholder="Add description..."
                    className="h-6 text-xs mt-1"
                    autoFocus
                  />
                ) : (
                  <button
                    onClick={() => setIsEditingDescription(true)}
                    className="text-xs text-muted-foreground hover:text-foreground text-left"
                  >
                    {form.description || 'Click to add description'}
                  </button>
                )}
              </div>
              
              <Badge variant={form.isPublished ? "default" : "secondary"}>
                {form.isPublished ? 'Published' : 'Draft'}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Preview Mode Selector */}
            <div className="hidden md:flex items-center space-x-1 bg-muted rounded-lg p-1">
              {(['desktop', 'tablet', 'mobile'] as PreviewMode[]).map((mode) => (
                <Button
                  key={mode}
                  size="sm"
                  variant={previewMode === mode ? "default" : "ghost"}
                  onClick={() => onPreviewModeChange(mode)}
                  className="text-xs h-8"
                >
                  <i className={`fas fa-${mode === 'desktop' ? 'desktop' : mode === 'tablet' ? 'tablet-alt' : 'mobile-alt'} mr-1`}></i>
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </Button>
              ))}
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onViewResponses}
                disabled={!form.id}
              >
                <i className="fas fa-chart-bar mr-2"></i>
                Responses
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={onPreview}
              >
                <i className="fas fa-eye mr-2"></i>
                Preview
              </Button>
              
              <Button
                variant="outline"
                onClick={onSave}
                disabled={isSaving}
                size="sm"
              >
                {isSaving ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>Saving...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save mr-2"></i>Save
                  </>
                )}
              </Button>
              
              <Button
                onClick={onShare}
                size="sm"
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              >
                <i className="fas fa-share mr-2"></i>Share
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}