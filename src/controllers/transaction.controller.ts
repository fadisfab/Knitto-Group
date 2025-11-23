import { Request, Response } from 'express';
import { TransactionService } from '../services/transaction.service';

const transactionService = new TransactionService();

export class TransactionController {
  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const { customerId, productId, quantity, city } = req.body;
      
      if (!customerId || !productId || !quantity || !city) {
        res.status(400).json({ 
          error: 'customerId, productId, quantity, and city are required' 
        });
        return;
      }

      if (quantity <= 0) {
        res.status(400).json({ error: 'Quantity must be more than 0' });
        return;
      }

      const result = await transactionService.createOrderWithTransaction({
        customerId,
        productId,
        quantity,
        city
      });

      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to create order' 
      });
    }
  }
}