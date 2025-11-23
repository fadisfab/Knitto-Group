import { db } from '../config/database';
import { Product, CreateProductRequest, UpdateProductRequest, ProductResponse } from '../types/product.types';
import { Logger } from '../utils/logger.util';

export class ProductService {
  async createProduct(productData: CreateProductRequest): Promise<Product> {
    try {
      const query = `
        INSERT INTO products (name, description, price, stock, category, sku, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        RETURNING *
      `;
      
      const values = [
        productData.name,
        productData.description,
        productData.price,
        productData.stock,
        productData.category,
        productData.sku
      ];

      const result = await db.query(query, values);
      Logger.info('Product created successfully', { productId: result.rows[0].id });
      
      return result.rows[0] as Product;
    } catch (error) {
      if (error instanceof Error && error.message.includes('duplicate key')) {
        throw new Error('Product SKU already exists');
      }
      throw new Error(`Failed to create product: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getAllProducts(): Promise<Product[]> {
    try {
      const query = `
        SELECT * FROM products 
        ORDER BY created_at DESC
      `;
      
      const result = await db.query(query);
      return result.rows as Product[];
    } catch (error) {
      throw new Error(`Failed to fetch products: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getProductById(id: string): Promise<Product> {
    try {
      const query = 'SELECT * FROM products WHERE id = $1';
      const result = await db.query(query, [id]);
      
      if (result.rows.length === 0) {
        throw new Error('Product not found');
      }
      
      return result.rows[0] as Product;
    } catch (error) {
      throw new Error(`Failed to fetch product: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getProductBySku(sku: string): Promise<Product> {
    try {
      const query = 'SELECT * FROM products WHERE sku = $1';
      const result = await db.query(query, [sku]);
      
      if (result.rows.length === 0) {
        throw new Error('Product not found');
      }
      
      return result.rows[0] as Product;
    } catch (error) {
      throw new Error(`Failed to fetch product: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateProduct(id: string, productData: UpdateProductRequest): Promise<Product> {
    try {
      const existingProduct = await this.getProductById(id);

      if (!existingProduct) {
        throw new Error('Product not found');
      }
      
      const fields = [];
      const values = [];
      let paramCount = 1;

      if (productData.name !== undefined) {
        fields.push(`name = $${paramCount}`);
        values.push(productData.name);
        paramCount++;
      }

      if (productData.description !== undefined) {
        fields.push(`description = $${paramCount}`);
        values.push(productData.description);
        paramCount++;
      }

      if (productData.price !== undefined) {
        fields.push(`price = $${paramCount}`);
        values.push(productData.price);
        paramCount++;
      }

      if (productData.stock !== undefined) {
        fields.push(`stock = $${paramCount}`);
        values.push(productData.stock);
        paramCount++;
      }

      if (productData.category !== undefined) {
        fields.push(`category = $${paramCount}`);
        values.push(productData.category);
        paramCount++;
      }

      if (productData.sku !== undefined) {
        fields.push(`sku = $${paramCount}`);
        values.push(productData.sku);
        paramCount++;
      }

      if (fields.length === 0) {
        throw new Error('No fields to update');
      }

      values.push(id);

      const query = `
        UPDATE products 
        SET ${fields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await db.query(query, values);
      Logger.info('Product updated successfully', { productId: id });
      
      return result.rows[0] as Product;
    } catch (error) {
      if (error instanceof Error && error.message.includes('duplicate key')) {
        throw new Error('Product SKU already exists');
      }
      throw new Error(`Failed to update product: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      const query = 'DELETE FROM products WHERE id = $1';
      const result = await db.query(query, [id]);
      
      if (result.rowCount === 0) {
        throw new Error('Product not found');
      }
      
      Logger.info('Product deleted successfully', { productId: id });
    } catch (error) {
      throw new Error(`Failed to delete product: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}