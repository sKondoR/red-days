// src/data/models/CycleRecord.ts
export interface CycleRecord {
  id?: number;
  userId: string;
  date: Date;
  cycleDay: number;
  symptoms: string[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export class CycleRecordModel implements CycleRecord {
  id?: number;
  userId: string;
  date: Date;
  cycleDay: number;
  symptoms: string[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Omit<CycleRecord, 'id'> & { id?: number }) {
    this.id = data.id;
    this.userId = data.userId;
    this.date = data.date;
    this.cycleDay = data.cycleDay;
    this.symptoms = data.symptoms || [];
    this.notes = data.notes || '';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }
}