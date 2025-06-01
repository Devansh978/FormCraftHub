import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertFormSchema, insertResponseSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Form routes
  app.post("/api/forms", async (req, res) => {
    try {
      const validatedData = insertFormSchema.omit({ publicId: true }).parse(req.body);
      const form = await storage.createForm(validatedData);
      res.json(form);
    } catch (error) {
      res.status(400).json({ error: "Invalid form data" });
    }
  });

  app.get("/api/forms", async (req, res) => {
    try {
      const forms = await storage.getAllForms();
      res.json(forms);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch forms" });
    }
  });

  app.get("/api/forms/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const form = await storage.getForm(id);
      if (!form) {
        return res.status(404).json({ error: "Form not found" });
      }
      res.json(form);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch form" });
    }
  });

  app.get("/api/forms/public/:publicId", async (req, res) => {
    try {
      const { publicId } = req.params;
      const form = await storage.getFormByPublicId(publicId);
      if (!form) {
        return res.status(404).json({ error: "Form not found" });
      }
      res.json(form);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch form" });
    }
  });

  app.put("/api/forms/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertFormSchema.omit({ publicId: true }).partial().parse(req.body);
      const form = await storage.updateForm(id, validatedData);
      if (!form) {
        return res.status(404).json({ error: "Form not found" });
      }
      res.json(form);
    } catch (error) {
      res.status(400).json({ error: "Invalid form data" });
    }
  });

  app.delete("/api/forms/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteForm(id);
      if (!deleted) {
        return res.status(404).json({ error: "Form not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete form" });
    }
  });

  // Response routes
  app.post("/api/forms/:formId/responses", async (req, res) => {
    try {
      const formId = parseInt(req.params.formId);
      const form = await storage.getForm(formId);
      if (!form) {
        return res.status(404).json({ error: "Form not found" });
      }

      const responseData = insertResponseSchema.parse({
        formId,
        data: req.body.data,
        isComplete: req.body.isComplete || false,
      });

      const response = await storage.createResponse(responseData);
      res.json(response);
    } catch (error) {
      res.status(400).json({ error: "Invalid response data" });
    }
  });

  app.get("/api/forms/:formId/responses", async (req, res) => {
    try {
      const formId = parseInt(req.params.formId);
      const responses = await storage.getResponsesByFormId(formId);
      res.json(responses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch responses" });
    }
  });

  app.get("/api/responses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const response = await storage.getResponse(id);
      if (!response) {
        return res.status(404).json({ error: "Response not found" });
      }
      res.json(response);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch response" });
    }
  });

  app.delete("/api/responses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteResponse(id);
      if (!deleted) {
        return res.status(404).json({ error: "Response not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete response" });
    }
  });

  // Submit response to public form
  app.post("/api/public/:publicId/submit", async (req, res) => {
    try {
      const { publicId } = req.params;
      const form = await storage.getFormByPublicId(publicId);
      if (!form) {
        return res.status(404).json({ error: "Form not found" });
      }

      const responseData = insertResponseSchema.parse({
        formId: form.id,
        data: req.body.data,
        isComplete: req.body.isComplete || true,
      });

      const response = await storage.createResponse(responseData);
      res.json({ success: true, response });
    } catch (error) {
      res.status(400).json({ error: "Invalid response data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}