import { db } from '../config/database';

export class ReportService {
  async getTopCustomers(limit: number = 10): Promise<any[]> {
    try {
      const query = `
        SELECT 
          c.id,
          c.name,
          c.email,
          COUNT(o.id) as total_orders,
          COALESCE(SUM(o.total_price), 0) as total_spent
        FROM customers c
        LEFT JOIN orders o ON c.id = o.customer_id
        GROUP BY c.id, c.name, c.email
        ORDER BY total_spent DESC
        LIMIT $1
      `;
      
      const result = await db.query(query, [limit]);
      return result.rows;
    } catch (error) {
      throw new Error(`Failed to fetch top customers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getSalesByCity(): Promise<any[]> {
    try {
      const query = `
        SELECT 
          city,
          COUNT(*) as total_orders,
          SUM(total_price) as total_revenue,
          AVG(total_price) as average_order_value
        FROM orders
        GROUP BY city
        ORDER BY total_revenue DESC
      `;
      
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      throw new Error(`Failed to fetch sales by city: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getStockReport(): Promise<any[]> {
    try {
      const query = `
        SELECT 
          id,
          name,
          price,
          stock,
          CASE 
            WHEN stock = 0 THEN 'Out of Stock'
            WHEN stock < 10 THEN 'Low Stock'
            ELSE 'In Stock'
          END as stock_status
        FROM products
        ORDER BY stock ASC, name ASC
      `;
      
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      throw new Error(`Failed to fetch stock report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getMonthlyProductSales(year: number): Promise<any[]> {
    try {
      const query = `
        SELECT 
          EXTRACT(MONTH FROM o.created_at) as month,
          p.name as product_name,
          COUNT(o.id) as total_orders,
          SUM(o.quantity) as total_quantity,
          SUM(o.total_price) as total_revenue,
          AVG(o.quantity) as average_quantity_per_order
        FROM orders o
        JOIN products p ON o.product_id = p.id
        WHERE EXTRACT(YEAR FROM o.created_at) = $1
        GROUP BY EXTRACT(MONTH FROM o.created_at), p.name
        ORDER BY month ASC, total_revenue DESC
      `;
      
      const result = await db.query(query, [year]);
      return result.rows;
    } catch (error) {
      throw new Error(`Failed to fetch monthly product sales: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}