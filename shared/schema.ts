import { pgTable, text, serial, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const forms = pgTable("forms", {
  id: serial("id").primaryKey(),
  publicId: text("public_id").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  fields: jsonb("fields").notNull().$type<FormField[]>(),
  steps: jsonb("steps").notNull().$type<FormStep[]>(),
  settings: jsonb("settings").notNull().$type<FormSettings>(),
  isPublished: boolean("is_published").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const responses = pgTable("responses", {
  id: serial("id").primaryKey(),
  formId: serial("form_id").notNull().references(() => forms.id),
  data: jsonb("data").notNull().$type<Record<string, any>>(),
  isComplete: boolean("is_complete").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export interface FormField {
  id: string;
  type: 'text' | 'email' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'phone' | 'file' | 'range';
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

export const insertFormSchema = createInsertSchema(forms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertResponseSchema = createInsertSchema(responses).omit({
  id: true,
  createdAt: true,
});

export type InsertForm = z.infer<typeof insertFormSchema>;
export type Form = typeof forms.$inferSelect;
export type InsertResponse = z.infer<typeof insertResponseSchema>;
export type Response = typeof responses.$inferSelect;
