// src/data/repositories/CycleHistoryRepositoryImpl.ts
import { CycleHistoryRepositoryContract } from '../contracts/CycleHistoryRepositoryContract';
import { CycleHistory } from '../models/CycleHistory';
import { SQLiteProvider } from '../local/SQLiteProvider';

export class CycleHistoryRepositoryImpl implements CycleHistoryRepositoryContract {
  private db = SQLiteProvider.getDatabase();
  private tableName = 'cycle_history';

  async findById(id: number): Promise<CycleHistory | null> {
    const result = await this.db.getAllAsync(
      `SELECT * FROM ${this.tableName} WHERE id = ?`,
      [id]
    ) as unknown as CycleHistory[];

    return result.length > 0 ? result[0] : null;
  }

  async findAll(): Promise<CycleHistory[]> {
    const result = await this.db.getAllAsync(`SELECT * FROM ${this.tableName}`) as unknown as CycleHistory[];
    return result;
  }

  async findByUserId(userId: string): Promise<CycleHistory | null> {
    const result = await this.db.getAllAsync(
      `SELECT * FROM ${this.tableName} WHERE user_id = ?`,
      [userId]
    ) as unknown as CycleHistory[];

    return result.length > 0 ? result[0] : null;
  }

  async updateCycles(userId: string, cycles: any[]): Promise<CycleHistory> {
    // Get existing record or create new one
    let history = await this.findByUserId(userId);
    
    if (history) {
      await this.db.runAsync(
        `UPDATE ${this.tableName} SET start_date = ?, end_date = ?, average_length = ?, updated_at = ? WHERE user_id = ?`,
        [
          history.startDate?.toISOString().split('T')[0] || null,
          history.endDate?.toISOString().split('T')[0] || null,
          history.averageLength,
          new Date().toISOString(),
          userId
        ]
      );
      
      history = {
        ...history,
        cycles,
        updatedAt: new Date()
      };
    } else {
      const result = await this.db.runAsync(
        `INSERT INTO ${this.tableName} (user_id, start_date, end_date, average_length, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          userId,
          null,
          null,
          28,
          new Date().toISOString(),
          new Date().toISOString()
        ]
      );
      
      history = {
        id: result.lastInsertRowId as number,
        userId,
        cycles,
        startDate: null,
        endDate: null,
        averageLength: 28,
        nextExpectedDate: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
    
    return history;
  }

  async addCycleRecord(userId: string, cycleRecord: any): Promise<CycleHistory> {
    const history = await this.findByUserId(userId);
    
    if (history) {
      // Update existing history
      return await this.updateCycles(userId, [...history.cycles, cycleRecord]);
    } else {
      // Create new history
      return await this.updateCycles(userId, [cycleRecord]);
    }
  }

  async getCycleSummary(userId: string): Promise<{
    cycleCount: number;
    startDate: Date | null;
    endDate: Date | null;
    averageLength: number;
  }> {
    const result = await this.db.getAllAsync(
      `SELECT 
        COUNT(*) as cycleCount,
        MIN(date) as startDate,
        MAX(date) as endDate,
        AVG(cycle_day) as averageLength
       FROM cycle_records 
       WHERE user_id = ?`,
      [userId]
    ) as Array<{ cycleCount: number; startDate: string | null; endDate: string | null; averageLength: number }>;

    if (result.length > 0) {
      const row = result[0];
      return {
        cycleCount: row.cycleCount,
        startDate: row.startDate ? new Date(row.startDate) : null,
        endDate: row.endDate ? new Date(row.endDate) : null,
        averageLength: row.averageLength || 28
      };
    }

    return {
      cycleCount: 0,
      startDate: null,
      endDate: null,
      averageLength: 28
    };
  }

  async save(entity: CycleHistory): Promise<CycleHistory> {
    const result = await this.db.runAsync(
      `INSERT INTO ${this.tableName} (user_id, start_date, end_date, average_length, next_expected_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        entity.userId,
        entity.startDate?.toISOString().split('T')[0] || null,
        entity.endDate?.toISOString().split('T')[0] || null,
        entity.averageLength,
        entity.nextExpectedDate?.toISOString().split('T')[0] || null,
        entity.createdAt.toISOString(),
        entity.updatedAt.toISOString()
      ]
    );
    
    return { ...entity, id: result.lastInsertRowId as number };
  }

  async update(id: number, entity: CycleHistory): Promise<CycleHistory> {
    await this.db.runAsync(
      `UPDATE ${this.tableName} SET user_id = ?, start_date = ?, end_date = ?, average_length = ?, next_expected_date = ?, updated_at = ? WHERE id = ?`,
      [
        entity.userId,
        entity.startDate?.toISOString().split('T')[0] || null,
        entity.endDate?.toISOString().split('T')[0] || null,
        entity.averageLength,
        entity.nextExpectedDate?.toISOString().split('T')[0] || null,
        entity.updatedAt.toISOString(),
        id
      ]
    );
    
    return { ...entity, id };
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.db.runAsync(
      `DELETE FROM ${this.tableName} WHERE id = ?`,
      [id]
    );
    
    return result.changes > 0;
  }

  async exists(id: number): Promise<boolean> {
    const result = await this.db.getAllAsync(
      `SELECT 1 FROM ${this.tableName} WHERE id = ? LIMIT 1`,
      [id]
    );
    
    return result.length > 0;
  }
}