// src/data/contracts/CycleRepositoryContract.ts
import { BaseRepositoryContract } from './BaseRepositoryContract';
import { CycleRecord } from '../models/CycleRecord';

export interface CycleRepositoryContract extends BaseRepositoryContract<CycleRecord> {
  findByDate(userId: string, date: Date): Promise<CycleRecord | null>;
  findByUserId(userId: string): Promise<CycleRecord[]>;
  findByDateRange(userId: string, startDate: Date, endDate: Date): Promise<CycleRecord[]>;
  getLastCycleRecord(userId: string): Promise<CycleRecord | null>;
  getCycleRecordsForMonth(userId: string, year: number, month: number): Promise<CycleRecord[]>;
}