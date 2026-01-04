
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertProductSchema, insertMovementSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Products Routes
  app.get(api.products.list.path, async (req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.get(api.products.get.path, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
    
    const product = await storage.getProduct(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  });

  app.post(api.products.create.path, async (req, res) => {
    try {
      const data = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(data);
      res.status(201).json(product);
    } catch (e) {
      if (e instanceof z.ZodError) {
        return res.status(400).json({ message: e.errors[0].message });
      }
      throw e;
    }
  });

  app.put(api.products.update.path, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    try {
      const data = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(id, data);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (e) {
      if (e instanceof z.ZodError) {
        return res.status(400).json({ message: e.errors[0].message });
      }
      throw e;
    }
  });

  app.delete(api.products.delete.path, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    await storage.deleteProduct(id);
    res.status(204).send();
  });

  // Movements Routes
  app.get(api.movements.list.path, async (req, res) => {
    const movements = await storage.getMovements();
    res.json(movements);
  });

  app.post(api.movements.create.path, async (req, res) => {
    try {
      const data = insertMovementSchema.parse(req.body);
      const movement = await storage.createMovement(data);
      res.status(201).json(movement);
    } catch (e) {
        console.error(e);
      if (e instanceof z.ZodError) {
        return res.status(400).json({ message: e.errors[0].message });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.movements.byProduct.path, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const movements = await storage.getMovementsByProduct(id);
    res.json(movements);
  });

  // Seed Data
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
    const products = await storage.getProducts();
    if (products.length === 0) {
        await storage.createProduct({
            name: "Paracetamol 500mg",
            category: "Medicamentos",
            quantity: 50,
            unit: "cx",
            batch: "BATCH001",
            expirationDate: new Date("2025-12-31").toISOString(),
            supplier: "PharmaCorp"
        });
        await storage.createProduct({
            name: "Luvas Cirúrgicas M",
            category: "EPIs",
            quantity: 5,
            unit: "cx",
            batch: "LUV2024",
            expirationDate: new Date("2026-06-30").toISOString(),
            supplier: "MedEquip"
        });
        await storage.createProduct({
            name: "Bisturi Descartável #15",
            category: "Materiais cirúrgicos",
            quantity: 100,
            unit: "un",
            batch: "BIS2023",
            expirationDate: new Date("2024-02-01").toISOString(), // Expired
            supplier: "SurgicalTools Inc"
        });
         await storage.createProduct({
            name: "Gaze Estéril",
            category: "Materiais de curativo",
            quantity: 20,
            unit: "pct",
            batch: "GAZ009",
            expirationDate: new Date("2024-04-10").toISOString(), // Expiring soon
            supplier: "CleanMed"
        });
    }
}
