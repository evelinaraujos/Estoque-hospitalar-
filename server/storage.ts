
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import {
  products, movements,
  type Product, type InsertProduct,
  type Movement, type InsertMovement
} from "@shared/schema";

export interface IStorage {
  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<void>;

  // Movements
  getMovements(): Promise<Movement[]>;
  createMovement(movement: InsertMovement): Promise<Movement>;
  getMovementsByProduct(productId: number): Promise<Movement[]>;
}

export class DatabaseStorage implements IStorage {
  // Products
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(desc(products.createdAt));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  async updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const [product] = await db
      .update(products)
      .set(updates)
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // Movements
  async getMovements(): Promise<Movement[]> {
    return await db.select().from(movements).orderBy(desc(movements.date));
  }

  async createMovement(insertMovement: InsertMovement): Promise<Movement> {
    // Start transaction to ensure data integrity
    return await db.transaction(async (tx) => {
      // 1. Create Movement
      const [movement] = await tx.insert(movements).values(insertMovement).returning();

      // 2. Update Product Quantity
      const [product] = await tx.select().from(products).where(eq(products.id, insertMovement.productId));
      
      if (!product) throw new Error("Product not found");

      let newQuantity = product.quantity;
      if (insertMovement.type === 'IN') {
        newQuantity += insertMovement.quantity;
      } else if (insertMovement.type === 'OUT') {
        newQuantity -= insertMovement.quantity;
      }

      await tx.update(products)
        .set({ quantity: newQuantity })
        .where(eq(products.id, insertMovement.productId));

      return movement;
    });
  }

  async getMovementsByProduct(productId: number): Promise<Movement[]> {
    return await db.select().from(movements).where(eq(movements.productId, productId)).orderBy(desc(movements.date));
  }
}

export const storage = new DatabaseStorage();
