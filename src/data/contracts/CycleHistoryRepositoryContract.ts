// src/data/contracts/CycleHistoryRepositoryContract.ts
import { BaseRepositoryContract } from './BaseRepositoryContract';
import { CycleHistory } from '../models/CycleHistory';

export interface CycleHistoryRepositoryContract extends BaseRepositoryContract<CycleHistory> {
  findByUserId(userId: string): Promise<CycleHistory | null>;
  updateCycles(userId: string, cycles: any[]): Promise<CycleHistory>;
  addCycleRecord(userId: string, cycleRecord: any): Promise<CycleHistory>;
  getCycleSummary(userId: string): Promise<{
    cycleCount: number;
    startDate: Date | null;
    endDate: Date | null;
    averageLength: number;
  }>;
}