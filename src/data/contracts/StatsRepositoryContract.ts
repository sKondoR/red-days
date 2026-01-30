// src/data/contracts/StatsRepositoryContract.ts
import { BaseRepositoryContract } from './BaseRepositoryContract';
import { StatisticsData } from '../models/StatisticsData';

export interface StatsRepositoryContract extends BaseRepositoryContract<StatisticsData> {
  findByUserId(userId: string): Promise<StatisticsData | null>;
  updateStatistics(userId: string): Promise<StatisticsData>;
  calculateCycleStats(userId: string): Promise<{
    cycleCount: number;
    averageCycleLength: number;
    shortestCycle: number;
    longestCycle: number;
    averagePeriodDays: number;
  }>;
  getSymptomFrequency(userId: string): Promise<Record<string, number>>;
}