
import { pgTable, text, serial, integer, date, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // Medicamentos, Materiais cirúrgicos, EPIs, etc.
  quantity: integer("quantity").notNull().default(0),
  unit: text("unit").notNull(), // cx, un, lt, etc.
  batch: text("batch"),
  expirationDate: date("expiration_date"),
  supplier: text("supplier"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const movements = pgTable("movements", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id),
  type: text("type").notNull(), // 'IN' or 'OUT'
  quantity: integer("quantity").notNull(),
  date: timestamp("date").defaultNow(),
});

export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true });
export const insertMovementSchema = createInsertSchema(movements).omit({ id: true, date: true });

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Movement = typeof movements.$inferSelect;
export type InsertMovement = z.infer<typeof insertMovementSchema>;

export const categories = [
  "Medicamentos",
  "Materiais cirúrgicos",
  "EPIs",
  "Materiais de curativo",
  "Descartáveis",
  "Equipamentos",
] as const;
