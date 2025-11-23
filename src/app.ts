import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { db } from './config/database';

import { AuthController } from './controllers/auth.controller';
import { DataController } from './controllers/data.controller';
import { ExternalController } from './controllers/external.controller';
import { TransactionController } from './controllers/transaction.controller';
import { ReportController } from './controllers/report.controller';
import { ProductController } from './controllers/product.controller';

import { SchedulerService } from './services/scheduler.service';

import { authenticateToken } from './middleware/auth.middleware';
import { errorHandler } from './middleware/error.middleware';
import { Logger } from './utils/logger.util';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  Logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

const authController = new AuthController();
const dataController = new DataController();
const externalController = new ExternalController();
const transactionController = new TransactionController();
const reportController = new ReportController();
const productController = new ProductController();

// Routes - Public
app.post('/auth/register', authController.register);
app.post('/auth/login/email', authController.loginWithEmail);
app.post('/auth/login/username', authController.loginWithUsername);

app.get('/health', async (req, res) => {
  try {
    await db.query('SELECT 1 as health_check');
    
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: 'connected'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Database connection failed'
    });
  }
});

// Routes - Protected
app.use(authenticateToken);

app.post('/data', dataController.createRecord);
app.get('/data', dataController.getAllRecords);

app.get('/external/posts', externalController.getPosts);
app.post('/external/posts', externalController.createPost);

app.post('/orders', transactionController.createOrder);

app.get('/reports/top-customers', reportController.getTopCustomers);
app.get('/reports/sales-by-city', reportController.getSalesByCity);
app.get('/reports/stock', reportController.getStockReport);
app.get('/reports/monthly-sales', reportController.getMonthlyProductSales);

app.get('/products', productController.getAllProducts);
app.get('/products/id/:id', productController.getProductById);
app.get('/products/sku/:sku', productController.getProductBySku);
app.post('/products', productController.createProduct);
app.put('/products/:id', productController.updateProduct);
app.delete('/products/:id', productController.deleteProduct);

app.use(errorHandler);

async function testDatabaseConnection(): Promise<boolean> {
  try {
    await db.query('SELECT 1');
    Logger.info('Database connection established successfully');
    return true;
  } catch (error) {
    Logger.error('Database connection failed:', error);
    return false;
  }
}

async function startServer(): Promise<void> {
  const dbConnected = await testDatabaseConnection();
  
  if (!dbConnected) {
    Logger.error('Cannot start server without database connection');
    process.exit(1);
  }

  app.listen(PORT, () => {
    Logger.info(`Server running on port ${PORT}`);
    Logger.info(`Environment: ${process.env.NODE_ENV}`);
    
    // Start scheduler
    const schedulerService = new SchedulerService();
    schedulerService.startAllSchedulers();
    Logger.info('All schedulers started successfully');
  });
}

process.on('uncaughtException', (error) => {
  Logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  Logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

// Start server
startServer().catch(error => {
  Logger.error('Failed to start server:', error);
  process.exit(1);
});

export default app;