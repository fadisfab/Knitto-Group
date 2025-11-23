import { Request, Response } from 'express';
import { ReportService } from '../services/report.service';

const reportService = new ReportService();

export class ReportController {
  async getTopCustomers(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const report = await reportService.getTopCustomers(limit);
      res.json(report);
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to generate report' 
      });
    }
  }

  async getSalesByCity(req: Request, res: Response): Promise<void> {
    try {
      const report = await reportService.getSalesByCity();
      res.json(report);
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to generate report' 
      });
    }
  }

  async getStockReport(req: Request, res: Response): Promise<void> {
    try {
      const report = await reportService.getStockReport();
      res.json(report);
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to generate report' 
      });
    }
  }

  async getMonthlyProductSales(req: Request, res: Response): Promise<void> {
    try {
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      const report = await reportService.getMonthlyProductSales(year);
      res.json(report);
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to generate report' 
      });
    }
  }
}