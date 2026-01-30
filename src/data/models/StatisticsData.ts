// src/data/models/StatisticsData.ts
export interface StatisticsData {
  id?: number;
  userId: string;
  cycleCount: number;
  averageCycleLength: number;
  shortestCycle: number;
  longestCycle: number;
  averagePeriodDays: number;
  predictionAccuracy: number;
  symptomFrequency: Record<string, number>;
  fertilityWindow?: {
    startDate: Date;
    endDate: Date;
  };
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class StatisticsDataModel implements StatisticsData {
  id?: number;
  userId: string;
  cycleCount: number;
  averageCycleLength: number;
  shortestCycle: number;
  longestCycle: number;
  averagePeriodDays: number;
  predictionAccuracy: number;
  symptomFrequency: Record<string, number>;
  fertilityWindow?: {
    startDate: Date;
    endDate: Date;
  };
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Omit<StatisticsData, 'id'> & { id?: number }) {
    this.id = data.id;
    this.userId = data.userId;
    this.cycleCount = data.cycleCount || 0;
    this.averageCycleLength = data.averageCycleLength || 28;
    this.shortestCycle = data.shortestCycle || 21;
    this.longestCycle = data.longestCycle || 35;
    this.averagePeriodDays = data.averagePeriodDays || 5;
    this.predictionAccuracy = data.predictionAccuracy || 0;
    this.symptomFrequency = data.symptomFrequency || {};
    this.fertilityWindow = data.fertilityWindow;
    this.lastUpdated = data.lastUpdated || new Date();
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }
}