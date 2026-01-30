// src/data/repositories/StatsRepositoryImpl.ts
import { StatsRepositoryContract } from '../contracts/StatsRepositoryContract';
import { StatisticsData } from '../models/StatisticsData';
import { SQLiteProvider } from '../local/SQLiteProvider';

export class StatsRepositoryImpl implements StatsRepositoryContract {
  private db = SQLiteProvider.getDatabase();
  private tableName = 'statistics_data';

  async findById(id: number): Promise<StatisticsData | null> {
    const result = await this.db.getAllAsync(
      `SELECT * FROM ${this.tableName} WHERE id = ?`,
      [id]
    ) as unknown as StatisticsData[];

    return result.length > 0 ? result[0] : null;
  }

  async findAll(): Promise<StatisticsData[]> {
    const result = await this.db.getAllAsync(`SELECT * FROM ${this.tableName}`) as unknown as StatisticsData[];
    return result;
  }

  async findByUserId(userId: string): Promise<StatisticsData | null> {
    const result = await this.db.getAllAsync(
      `SELECT * FROM ${this.tableName} WHERE user_id = ?`,
      [userId]
    ) as unknown as StatisticsData[];

    return result.length > 0 ? result[0] : null;
  }

  async updateStatistics(userId: string): Promise<StatisticsData> {
    const stats = await this.calculateCycleStats(userId);
    const symptomFrequency = await this.getSymptomFrequency(userId);

    // Check if a record already exists for this user
    let existingStats = await this.findByUserId(userId);

    if (existingStats) {
      // Update existing record
      await this.db.runAsync(
        `UPDATE ${this.tableName} 
         SET cycle_count = ?, average_cycle_length = ?, shortest_cycle = ?, longest_cycle = ?, 
             average_period_days = ?, prediction_accuracy = ?, symptom_frequency = ?, last_updated = ?, updated_at = ? 
         WHERE user_id = ?`,
        [
          stats.cycleCount,
          stats.averageCycleLength,
          stats.shortestCycle,
          stats.longestCycle,
          stats.averagePeriodDays,
          existingStats.predictionAccuracy, // Keep existing accuracy for now
          JSON.stringify(symptomFrequency),
          new Date().toISOString(),
          new Date().toISOString(),
          userId
        ]
      );

      // Fetch the updated record
      existingStats = await this.findByUserId(userId);
      return existingStats!;
    } else {
      // Create new record
      const result = await this.db.runAsync(
        `INSERT INTO ${this.tableName} 
         (user_id, cycle_count, average_cycle_length, shortest_cycle, longest_cycle, 
          average_period_days, prediction_accuracy, symptom_frequency, last_updated, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          stats.cycleCount,
          stats.averageCycleLength,
          stats.shortestCycle,
          stats.longestCycle,
          stats.averagePeriodDays,
          0, // Default accuracy
          JSON.stringify(symptomFrequency),
          new Date().toISOString(),
          new Date().toISOString(),
          new Date().toISOString()
        ]
      );

      return {
        id: result.lastInsertRowId as number,
        userId,
        cycleCount: stats.cycleCount,
        averageCycleLength: stats.averageCycleLength,
        shortestCycle: stats.shortestCycle,
        longestCycle: stats.longestCycle,
        averagePeriodDays: stats.averagePeriodDays,
        predictionAccuracy: 0,
        symptomFrequency,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
  }

  async calculateCycleStats(userId: string): Promise<{
    cycleCount: number;
    averageCycleLength: number;
    shortestCycle: number;
    longestCycle: number;
    averagePeriodDays: number;
  }> {
    // Get all cycle records for the user
    const cycleRecordsResult = await this.db.getAllAsync(
      `SELECT * FROM cycle_records WHERE user_id = ? ORDER BY date ASC`,
      [userId]
    ) as Array<{ date: string; cycle_day: number }>;

    if (cycleRecordsResult.length === 0) {
      return {
        cycleCount: 0,
        averageCycleLength: 28,
        shortestCycle: 21,
        longestCycle: 35,
        averagePeriodDays: 5
      };
    }

    // Calculate statistics
    const cycleCount = cycleRecordsResult.length;
    const dates = cycleRecordsResult.map(record => new Date(record.date));
    
    // Calculate average cycle length based on differences between consecutive periods
    let totalCycleLength = 0;
    let cycleLengthCount = 0;
    let shortestCycle = Infinity;
    let longestCycle = -Infinity;
    
    for (let i = 1; i < dates.length; i++) {
      const diffTime = Math.abs(dates[i].getTime() - dates[i - 1].getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      totalCycleLength += diffDays;
      cycleLengthCount++;
      
      if (diffDays < shortestCycle) shortestCycle = diffDays;
      if (diffDays > longestCycle) longestCycle = diffDays;
    }
    
    const averageCycleLength = cycleLengthCount > 0 ? totalCycleLength / cycleLengthCount : 28;
    
    // Calculate average period days (days with lower cycle_day values indicating period)
    const periodDays = cycleRecordsResult.filter(record => record.cycle_day <= 7); // Assuming first 7 days are period
    const averagePeriodDays = periodDays.length > 0 ? periodDays.length / (cycleCount > 0 ? cycleCount : 1) : 5;

    return {
      cycleCount,
      averageCycleLength: Math.round(averageCycleLength * 100) / 100, // Round to 2 decimal places
      shortestCycle: isFinite(shortestCycle) ? shortestCycle : 21,
      longestCycle: isFinite(longestCycle) ? longestCycle : 35,
      averagePeriodDays: Math.round(averagePeriodDays * 100) / 100
    };
  }

  async getSymptomFrequency(userId: string): Promise<Record<string, number>> {
    const result = await this.db.getAllAsync(
      `SELECT symptoms FROM cycle_records WHERE user_id = ?`,
      [userId]
    ) as Array<{ symptoms: string }>;

    const frequencyMap: Record<string, number> = {};

    result.forEach(row => {
      try {
        const symptoms = JSON.parse(row.symptoms) as string[];
        symptoms.forEach(symptom => {
          frequencyMap[symptom] = (frequencyMap[symptom] || 0) + 1;
        });
      } catch (e) {
        // If parsing fails, skip this record
        console.warn('Could not parse symptoms:', row.symptoms);
      }
    });

    return frequencyMap;
  }

  async save(entity: StatisticsData): Promise<StatisticsData> {
    const result = await this.db.runAsync(
      `INSERT INTO ${this.tableName} 
       (user_id, cycle_count, average_cycle_length, shortest_cycle, longest_cycle, 
        average_period_days, prediction_accuracy, symptom_frequency, last_updated, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        entity.userId,
        entity.cycleCount,
        entity.averageCycleLength,
        entity.shortestCycle,
        entity.longestCycle,
        entity.averagePeriodDays,
        entity.predictionAccuracy,
        JSON.stringify(entity.symptomFrequency),
        entity.lastUpdated.toISOString(),
        entity.createdAt.toISOString(),
        entity.updatedAt.toISOString()
      ]
    );
    
    return { ...entity, id: result.lastInsertRowId as number };
  }

  async update(id: number, entity: StatisticsData): Promise<StatisticsData> {
    await this.db.runAsync(
      `UPDATE ${this.tableName} 
       SET user_id = ?, cycle_count = ?, average_cycle_length = ?, shortest_cycle = ?, longest_cycle = ?, 
           average_period_days = ?, prediction_accuracy = ?, symptom_frequency = ?, last_updated = ?, updated_at = ? 
       WHERE id = ?`,
      [
        entity.userId,
        entity.cycleCount,
        entity.averageCycleLength,
        entity.shortestCycle,
        entity.longestCycle,
        entity.averagePeriodDays,
        entity.predictionAccuracy,
        JSON.stringify(entity.symptomFrequency),
        entity.lastUpdated.toISOString(),
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