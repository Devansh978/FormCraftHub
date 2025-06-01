import { forms, responses, type Form, type InsertForm, type Response, type InsertResponse } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export interface IStorage {
  // Form operations
  createForm(form: Omit<InsertForm, 'publicId'>): Promise<Form>;
  getForm(id: number): Promise<Form | undefined>;
  getFormByPublicId(publicId: string): Promise<Form | undefined>;
  updateForm(id: number, form: Partial<InsertForm>): Promise<Form | undefined>;
  deleteForm(id: number): Promise<boolean>;
  getAllForms(): Promise<Form[]>;
  
  // Response operations
  createResponse(response: InsertResponse): Promise<Response>;
  getResponsesByFormId(formId: number): Promise<Response[]>;
  getResponse(id: number): Promise<Response | undefined>;
  deleteResponse(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getForm(id: number): Promise<Form | undefined> {
    const [form] = await db.select().from(forms).where(eq(forms.id, id));
    return form || undefined;
  }

  async getFormByPublicId(publicId: string): Promise<Form | undefined> {
    const [form] = await db.select().from(forms).where(eq(forms.publicId, publicId));
    return form || undefined;
  }

  async createForm(insertForm: Omit<InsertForm, 'publicId'>): Promise<Form> {
    const publicId = nanoid(10);
    const [form] = await db
      .insert(forms)
      .values({ ...insertForm, publicId })
      .returning();
    return form;
  }

  async updateForm(id: number, updateData: Partial<InsertForm>): Promise<Form | undefined> {
    const [form] = await db
      .update(forms)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(forms.id, id))
      .returning();
    return form || undefined;
  }

  async deleteForm(id: number): Promise<boolean> {
    const result = await db.delete(forms).where(eq(forms.id, id));
    return result.rowCount > 0;
  }

  async getAllForms(): Promise<Form[]> {
    return await db.select().from(forms);
  }

  async createResponse(insertResponse: InsertResponse): Promise<Response> {
    const [response] = await db
      .insert(responses)
      .values(insertResponse)
      .returning();
    return response;
  }

  async getResponsesByFormId(formId: number): Promise<Response[]> {
    return await db.select().from(responses).where(eq(responses.formId, formId));
  }

  async getResponse(id: number): Promise<Response | undefined> {
    const [response] = await db.select().from(responses).where(eq(responses.id, id));
    return response || undefined;
  }

  async deleteResponse(id: number): Promise<boolean> {
    const result = await db.delete(responses).where(eq(responses.id, id));
    return result.rowCount > 0;
  }
}

export const storage = new DatabaseStorage();
