// src/data/models/AppSettings.ts
export interface AppSettings {
  id?: number;
  userId: string;
  theme: 'light' | 'dark' | 'auto';
  notificationsEnabled: boolean;
  reminderTime: string; // in HH:MM format
  units: 'metric' | 'imperial';
  language: string;
  privacyMode: boolean;
  dataSyncEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class AppSettingsModel implements AppSettings {
  id?: number;
  userId: string;
  theme: 'light' | 'dark' | 'auto';
  notificationsEnabled: boolean;
  reminderTime: string;
  units: 'metric' | 'imperial';
  language: string;
  privacyMode: boolean;
  dataSyncEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Omit<AppSettings, 'id'> & { id?: number }) {
    this.id = data.id;
    this.userId = data.userId;
    this.theme = data.theme || 'auto';
    this.notificationsEnabled = data.notificationsEnabled || true;
    this.reminderTime = data.reminderTime || '08:00';
    this.units = data.units || 'metric';
    this.language = data.language || 'en';
    this.privacyMode = data.privacyMode || false;
    this.dataSyncEnabled = data.dataSyncEnabled || false;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }
}