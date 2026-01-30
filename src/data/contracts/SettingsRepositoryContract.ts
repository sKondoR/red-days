// src/data/contracts/SettingsRepositoryContract.ts
import { BaseRepositoryContract } from './BaseRepositoryContract';
import { AppSettings } from '../models/AppSettings';

export interface SettingsRepositoryContract extends BaseRepositoryContract<AppSettings> {
  findByUserId(userId: string): Promise<AppSettings | null>;
  updateSettings(userId: string, settings: Partial<AppSettings>): Promise<AppSettings>;
  resetToDefaults(userId: string): Promise<AppSettings>;
  exportSettings(userId: string): Promise<any>;
  importSettings(userId: string, settingsData: any): Promise<AppSettings>;
}