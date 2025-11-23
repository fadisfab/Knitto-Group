import { Request, Response } from 'express';
import { DataService } from '../services/data.service';

const dataService = new DataService();

export class DataController {
  async createRecord(req: Request, res: Response): Promise<void> {
    try {
      const { data } = req.body;
      
      if (!data) {
        res.status(400).json({ error: 'Data is required' });
        return;
      }

      const record = await dataService.createDataRecord(data);
      res.status(201).json(record);
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to create record' 
      });
    }
  }

  async getAllRecords(req: Request, res: Response): Promise<void> {
    try {
      const records = await dataService.getAllDataRecords();
      res.json(records);
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to fetch records' 
      });
    }
  }
}