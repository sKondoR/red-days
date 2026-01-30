// src/data/models/CycleHistory.ts
import { CycleRecord } from './CycleRecord';

export interface CycleHistory {
  id?: number;
  userId: string;
  cycles: CycleRecord[];
  startDate: Date | null;
  endDate: Date | null;
  averageLength: number;
  nextExpectedDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class CycleHistoryModel implements CycleHistory {
  id?: number;
  userId: string;
  cycles: CycleRecord[];
  startDate: Date | null;
  endDate: Date | null;
  averageLength: number;
  nextExpectedDate: Date | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Omit<CycleHistory, 'id'> & { id?: number }) {
    this.id = data.id;
    this.userId = data.userId;
    this.cycles = data.cycles || [];
    this.startDate = data.startDate || null;
    this.endDate = data.endDate || null;
    this.averageLength = data.averageLength || 28;
    this.nextExpectedDate = data.nextExpectedDate || null;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }
}