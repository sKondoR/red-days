// src/data/repositories/CycleRepositoryImpl.ts
import { CycleRepositoryContract } from '../contracts/CycleRepositoryContract';
import { CycleRecord } from '../models/CycleRecord';
import { SQLiteProvider } from '../local/SQLiteProvider';

export class CycleRepositoryImpl implements CycleRepositoryContract {
  private db = SQLiteProvider.getDatabase();
  private tableName = 'cycle_records';

  async findById(id: number): Promise<CycleRecord | null> {
    const result = await this.db.getAllAsync(
      `SELECT * FROM ${this.tableName} WHERE id = ?`,
      [id]
    ) as unknown as CycleRecord[];

    return result.length > 0 ? result[0] : null;
  }

  async findAll(): Promise<CycleRecord[]> {
    const result = await this.db.getAllAsync(`SELECT * FROM ${this.tableName}`) as unknown as CycleRecord[];
    return result;
  }

  async findByDate(userId: string, date: Date): Promise<CycleRecord | null> {
    const dateString = date.toISOString().split('T')[0];
    const result = await this.db.getAllAsync(
      `SELECT * FROM ${this.tableName} WHERE user_id = ? AND date = ?`,
      [userId, dateString]
    ) as unknown as CycleRecord[];

    return result.length > 0 ? result[0] : null;
  }

  async findByUserId(userId: string): Promise<CycleRecord[]> {
    const result = await this.db.getAllAsync(
      `SELECT * FROM ${this.tableName} WHERE user_id = ? ORDER BY date DESC`,
      [userId]
    ) as unknown as CycleRecord[];
    return result;
  }

  async findByDateRange(userId: string, startDate: Date, endDate: Date): Promise<CycleRecord[]> {
    const startDateString = startDate.toISOString().split('T')[0];
    const endDateString = endDate.toISOString().split('T')[0];
    
    const result = await this.db.getAllAsync(
      `SELECT * FROM ${this.tableName} WHERE user_id = ? AND date BETWEEN ? AND ? ORDER BY date`,
      [userId, startDateString, endDateString]
    ) as unknown as CycleRecord[];
    
    return result;
  }

  async getLastCycleRecord(userId: string): Promise<CycleRecord | null> {
    const result = await this.db.getAllAsync(
      `SELECT * FROM ${this.tableName} WHERE user_id = ? ORDER BY date DESC LIMIT 1`,
      [userId]
    ) as unknown as CycleRecord[];

    return result.length > 0 ? result[0] : null;
  }

  async getCycleRecordsForMonth(userId: string, year: number, month: number): Promise<CycleRecord[]> {
    // Format month to be two digits
    const monthStr = month < 10 ? `0${month}` : `${month}`;
    const searchPattern = `${year}-${monthStr}%`;
    
    const result = await this.db.getAllAsync(
      `SELECT * FROM ${this.tableName} WHERE user_id = ? AND date LIKE ? ORDER BY date`,
      [userId, searchPattern]
    ) as unknown as CycleRecord[];
    
    return result;
  }

  async save(entity: CycleRecord): Promise<CycleRecord> {
    const result = await this.db.runAsync(
      `INSERT INTO ${this.tableName} (user_id, date, cycle_day, symptoms, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        entity.userId,
        entity.date.toISOString().split('T')[0],
        entity.cycleDay,
        JSON.stringify(entity.symptoms),
        entity.notes,
        entity.createdAt.toISOString(),
        entity.updatedAt.toISOString()
      ]
    );
    
    return { ...entity, id: result.lastInsertRowId as number };
  }

  async update(id: number, entity: CycleRecord): Promise<CycleRecord> {
    await this.db.runAsync(
      `UPDATE ${this.tableName} SET user_id = ?, date = ?, cycle_day = ?, symptoms = ?, notes = ?, updated_at = ? WHERE id = ?`,
      [
        entity.userId,
        entity.date.toISOString().split('T')[0],
        entity.cycleDay,
        JSON.stringify(entity.symptoms),
        entity.notes,
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