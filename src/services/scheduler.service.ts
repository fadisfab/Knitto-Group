import * as cron from 'node-cron';
import { db } from '../config/database';

export class SchedulerService {
  private tasks: Map<string, cron.ScheduledTask> = new Map();

  startAllSchedulers(): void {
    this.startCleanupTask();
    this.startHealthCheckTask();
  }

  private startCleanupTask(): void {
    // Interval harian pada jam 2 pagi
    const task = cron.schedule('0 2 * * *', async () => {
      try {
        console.log('Running cleanup task...');
        const query = 'DELETE FROM data_records WHERE created_at < NOW() - INTERVAL \'30 days\'';
        const result = await db.query(query);
        console.log(`Cleanup completed: ${result.rowCount} records deleted`);
      } catch (error) {
        console.error('Cleanup task failed:', error);
      }
    });

    this.tasks.set('cleanup', task);
  }

  private startHealthCheckTask(): void {
    // Interval 5 menit
    const task = cron.schedule('*/5 * * * *', async () => {
      try {
        console.log('Running health check task...');
        const result = await db.query('SELECT 1 as health_check');
        console.log('Database health check:', result.rows[0].health_check);
      } catch (error) {
        console.error('Health check failed:', error);
      }
    });

    this.tasks.set('health_check', task);
  }

  stopScheduler(taskName: string): void {
    const task = this.tasks.get(taskName);
    if (task) {
      task.stop();
      this.tasks.delete(taskName);
      console.log(`Scheduler ${taskName} stopped`);
    }
  }

  stopAllSchedulers(): void {
    this.tasks.forEach((task, name) => {
      task.stop();
      console.log(`Scheduler ${name} stopped`);
    });
    this.tasks.clear();
  }
}