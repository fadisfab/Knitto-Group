import { db } from '../config/database';

export class TransactionService {
  async createOrderWithTransaction(orderData: {
    customerId: string;
    productId: string;
    quantity: number;
    city: string;
  }): Promise<any> {
    const client = await db.connect();
    
    try {
      await client.query('BEGIN');

      const productQuery = 'SELECT * FROM products WHERE id = $1 FOR UPDATE';
      const productResult = await client.query(productQuery, [orderData.productId]);
      
      if (productResult.rows.length === 0) {
        throw new Error('Product not found');
      }

      const product = productResult.rows[0];
      if (product.stock < orderData.quantity) {
        throw new Error('Insufficient stock');
      }

      const totalPrice = product.price * orderData.quantity;

      const updateStockQuery = 'UPDATE products SET stock = stock - $1 WHERE id = $2';
      await client.query(updateStockQuery, [orderData.quantity, orderData.productId]);

      const orderQuery = `
        INSERT INTO orders (customer_id, product_id, quantity, total_price, city, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        RETURNING *
      `;
      const orderResult = await client.query(orderQuery, [
        orderData.customerId,
        orderData.productId,
        orderData.quantity,
        totalPrice,
        orderData.city
      ]);

      const updateCustomerQuery = `
        UPDATE customers 
        SET total_purchases = COALESCE(total_purchases, 0) + $1,
            last_purchase_date = NOW()
        WHERE id = $2
      `;
      await client.query(updateCustomerQuery, [totalPrice, orderData.customerId]);

      await client.query('COMMIT');
      
      return {
        order: orderResult.rows[0],
        product: { ...product, stock: product.stock - orderData.quantity }
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw new Error(`Transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      client.release();
    }
  }
}