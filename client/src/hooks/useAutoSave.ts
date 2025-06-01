import { useEffect, useRef } from 'react';
import { Form } from '@/types/form';

interface UseAutoSaveProps {
  form: Form;
  onSave: () => void;
  interval?: number; // milliseconds
  enabled?: boolean;
}

export function useAutoSave({ form, onSave, interval = 30000, enabled = true }: UseAutoSaveProps) {
  const lastSavedForm = useRef<string>('');
  const autoSaveTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!enabled) return;

    const currentFormString = JSON.stringify(form);
    
    // Clear existing timer
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }

    // Only auto-save if form has changed
    if (currentFormString !== lastSavedForm.current) {
      autoSaveTimer.current = setTimeout(() => {
        onSave();
        lastSavedForm.current = currentFormString;
      }, interval);
    }

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [form, onSave, interval, enabled]);

  // Update the last saved form when save is called externally
  useEffect(() => {
    lastSavedForm.current = JSON.stringify(form);
  }, [form.id, form.updatedAt]); // Update when form is actually saved
}