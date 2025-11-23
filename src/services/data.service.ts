import { db } from '../config/database';
import { DataRecord } from '../models/database.models';

export class DataService {
  private async getNextRunningNumber(): Promise<number> {
    const query = 'SELECT MAX(running_number) as max_number FROM data_records';
    const result = await db.query(query);
    return (result.rows[0].max_number || 0) + 1;
  }

  async createDataRecord(data: any): Promise<DataRecord> {
    const client = await db.connect();
    
    try {
      await client.query('BEGIN');
      
      const lockQuery = 'SELECT running_number FROM data_records ORDER BY running_number DESC LIMIT 1 FOR UPDATE';
      await client.query(lockQuery);
      
      const nextNumberQuery = 'SELECT COALESCE(MAX(running_number), 0) + 1 as next_number FROM data_records';
      const nextNumberResult = await client.query(nextNumberQuery);
      const nextNumber = nextNumberResult.rows[0].next_number;
      
      const uniqueCode = `DATA-${nextNumber.toString().padStart(6, '0')}`;
      
      const insertQuery = `
        INSERT INTO data_records (unique_code, running_number, data, created_at, updated_at)
        VALUES ($1, $2, $3, NOW(), NOW())
        RETURNING *
      `;
      
      const result = await client.query(insertQuery, [uniqueCode, nextNumber, JSON.stringify(data)]);
      await client.query('COMMIT');
      
      return result.rows[0] as DataRecord;
    } catch (error) {
      await client.query('ROLLBACK');
      throw new Error(`Failed to create data record: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      client.release();
    }
  }

  async getAllDataRecords(): Promise<DataRecord[]> {
    try {
      const query = 'SELECT * FROM data_records ORDER BY created_at DESC';
      const result = await db.query(query);
      return result.rows as DataRecord[];
    } catch (error) {
      throw new Error(`Failed to fetch data records: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}