import { Request, Response } from 'express';
import { ProductService } from '../services/product.service';
import { CreateProductRequest, UpdateProductRequest } from '../types/product.types';
import { ValidationUtil } from '../utils/validation.util';

const productService = new ProductService();

export class ProductController {
  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const productData: CreateProductRequest = req.body;

      if (!productData.name || !productData.sku) {
        res.status(400).json({ error: 'Product name and SKU are required' });
        return;
      }

      if (!ValidationUtil.isPositiveNumber(productData.price)) {
        res.status(400).json({ error: 'Price cannot be negative' });
        return;
      }

      if (!Number.isInteger(productData.stock) || productData.stock < 0) {
        res.status(400).json({ error: 'Stock caanot be negative' });
        return;
      }

      const product = await productService.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Failed to create product' 
      });
    }
  }

  async getAllProducts(req: Request, res: Response): Promise<void> {
    try {
      const products = await productService.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to fetch products' 
      });
    }
  }

  async getProductById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id || typeof id !== 'string') {
        res.status(400).json({ error: 'Product id is required' });
        return;
      }

      const product = await productService.getProductById(id);
      res.json(product);
    } catch (error) {
      if (error instanceof Error && error.message === 'Product not found') {
        res.status(404).json({ error: 'Product not found' });
      } else {
        res.status(500).json({ 
          error: error instanceof Error ? error.message : 'Failed to fetch product' 
        });
      }
    }
  }

  async getProductBySku(req: Request, res: Response): Promise<void> {
    try {
      const { sku } = req.params;
      if (!sku) {
        res.status(400).json({ error: 'SKU Product is required' });
        return;
      }
      const product = await productService.getProductBySku(sku);
      res.json(product);
    } catch (error) {
      if (error instanceof Error && error.message === 'Product not found') {
        res.status(404).json({ error: 'Product not found' });
      } else {
        res.status(500).json({ 
          error: error instanceof Error ? error.message : 'Failed to fetch product' 
        });
      }
    }
  }

  async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id || typeof id !== 'string') {
        res.status(400).json({ error: 'Product id is required' });
        return;
      }

      const productData: UpdateProductRequest = req.body;

      if (productData.price !== undefined && !ValidationUtil.isPositiveNumber(productData.price)) {
        res.status(400).json({ error: 'Price cannot be negative' });
        return;
      }

      if (productData.stock !== undefined && (!Number.isInteger(productData.stock) || productData.stock < 0)) {
        res.status(400).json({ error: 'Stock cannot be negative' });
        return;
      }

      const product = await productService.updateProduct(id, productData);
      res.json(product);
    } catch (error) {
      if (error instanceof Error && error.message === 'Product not found') {
        res.status(404).json({ error: 'Product not found' });
      } else {
        res.status(400).json({ 
          error: error instanceof Error ? error.message : 'Failed to update product' 
        });
      }
    }
  }

  async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id || typeof id !== 'string') {
        res.status(400).json({ error: 'Product id is required' });
        return;
      }

      await productService.deleteProduct(id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === 'Product not found') {
        res.status(404).json({ error: 'Product not found' });
      } else {
        res.status(500).json({ 
          error: error instanceof Error ? error.message : 'Failed to delete product' 
        });
      }
    }
  }
}