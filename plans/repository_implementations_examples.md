# Примеры реализации репозиториев

## 1. Общие принципы реализации

Все репозитории должны:
- Реализовывать соответствующие интерфейсы
- Использовать соответствующие провайдеры (SQLite или AsyncStorage)
- Обрабатывать ошибки и возвращать осмысленные сообщения
- Валидировать данные перед сохранением
- Использовать транзакции при необходимости

## 2. Пример реализации SQLiteProvider

```typescript
// src/data/local/SQLiteProvider.ts
import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

export class SQLiteProvider {
  private static instance: SQLiteProvider;
  private db: SQLite.SQLiteDatabase;

  private constructor() {
    // Используем разные имена баз для разных платформ при необходимости
    this.db = SQLite.openDatabase('cycle-tracker.db');
    
    // Выполняем начальные миграции
    this.initializeSchema();
  }

  public static getInstance(): SQLiteProvider {
    if (!SQLiteProvider.instance) {
      SQLiteProvider.instance = new SQLiteProvider();
    }
    return SQLiteProvider.instance;
  }

  private initializeSchema(): void {
    // Выполняем миграции базы данных
    this.db.transaction(tx => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS cycle_records (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT NOT NULL UNIQUE,
          cycle_day INTEGER,
          period_day BOOLEAN DEFAULT FALSE,
          symptoms TEXT,
          mood INTEGER,
          notes TEXT,
          flow_intensity INTEGER,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        );`
      );
      
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS cycle_histories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          start_date TEXT NOT NULL UNIQUE,
          end_date TEXT,
          cycle_length INTEGER,
          period_length INTEGER,
          average_cycle_length REAL,
          predicted_ovulation_date TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        );`
      );
      
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS statistics_data (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          cycle_id INTEGER,
          avg_cycle_length REAL,
          avg_period_length REAL,
          ovulation_patterns TEXT,
          fertile_window_start TEXT,
          fertile_window_end TEXT,
          pregnancy_probability REAL,
          calculated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (cycle_id) REFERENCES cycle_histories (id)
        );`
      );
    });
  }

  public getDatabase(): SQLite.SQLiteDatabase {
    return this.db;
  }

  public async executeQuery<T>(
    query: string,
    params?: any[]
  ): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.db.transaction(
        tx => {
          tx.executeSql(
            query,
            params || [],
            (_, resultSet) => {
              const results: T[] = [];
              for (let i = 0; i < resultSet.rows.length; i++) {
                results.push(resultSet.rows.item(i));
              }
              resolve(results);
            },
            (_, error) => {
              reject(error);
              return true;
            }
          );
        }
      );
    });
  }
}
```

## 3. Пример реализации AsyncStorageProvider

```typescript
// src/data/local/AsyncStorageProvider.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export class AsyncStorageProvider {
  private static instance: AsyncStorageProvider;
  
  private constructor() {}

  public static getInstance(): AsyncStorageProvider {
    if (!AsyncStorageProvider.instance) {
      AsyncStorageProvider.instance = new AsyncStorageProvider();
    }
    return AsyncStorageProvider.instance;
  }

  public async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error(`Error getting item ${key}:`, error);
      throw error;
    }
  }

  public async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error setting item ${key}:`, error);
      throw error;
    }
  }

  public async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item ${key}:`, error);
      throw error;
    }
  }

  public async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing AsyncStorage:', error);
      throw error;
    }
  }
}
```

## 4. Пример реализации репозитория для записей цикла

```typescript
// src/data/repositories/CycleRepositoryImpl.ts
import { CycleRepositoryContract } from '../contracts/CycleRepositoryContract';
import { CycleRecord } from '../models/CycleRecord';
import { SQLiteProvider } from '../local/SQLiteProvider';
import { z } from 'zod';

// Валидационная схема для CycleRecord
const cycleRecordSchema = z.object({
  id: z.number().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  cycle_day: z.number().int().nonnegative(),
  period_day: z.boolean(),
  symptoms: z.array(z.string()),
  mood: z.number().min(1).max(5).optional(),
  notes: z.string().max(1000).optional(),
  flow_intensity: z.number().min(1).max(5).optional(),
});

export class CycleRepositoryImpl implements CycleRepositoryContract {
  private db = SQLiteProvider.getInstance();

  async save(item: CycleRecord): Promise<void> {
    // Валидируем данные перед сохранением
    const parsedItem = cycleRecordSchema.parse(item);

    const query = `
      INSERT OR REPLACE INTO cycle_records 
      (id, date, cycle_day, period_day, symptoms, mood, notes, flow_intensity)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      parsedItem.id || null,
      parsedItem.date,
      parsedItem.cycle_day,
      parsedItem.period_day ? 1 : 0,
      JSON.stringify(parsedItem.symptoms),
      parsedItem.mood || null,
      parsedItem.notes || null,
      parsedItem.flow_intensity || null
    ];

    try {
      await this.db.executeQuery(query, params);
    } catch (error) {
      console.error('Error saving cycle record:', error);
      throw error;
    }
  }

  async getById(id: number): Promise<CycleRecord | null> {
    const query = 'SELECT * FROM cycle_records WHERE id = ?';
    const params = [id];
    
    try {
      const results = await this.db.executeQuery<any>(query, params);
      if (results.length === 0) {
        return null;
      }
      
      return this.mapToCycleRecord(results[0]);
    } catch (error) {
      console.error('Error getting cycle record by ID:', error);
      throw error;
    }
  }

  async getAll(): Promise<CycleRecord[]> {
    const query = 'SELECT * FROM cycle_records ORDER BY date DESC';
    
    try {
      const results = await this.db.executeQuery<any>(query);
      return results.map(row => this.mapToCycleRecord(row));
    } catch (error) {
      console.error('Error getting all cycle records:', error);
      throw error;
    }
  }

  async update(item: CycleRecord): Promise<void> {
    if (!item.id) {
      throw new Error('Cannot update record without ID');
    }
    
    // Валидируем данные перед обновлением
    const parsedItem = cycleRecordSchema.parse(item);
    
    const query = `
      UPDATE cycle_records 
      SET date = ?, cycle_day = ?, period_day = ?, symptoms = ?, 
          mood = ?, notes = ?, flow_intensity = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    const params = [
      parsedItem.date,
      parsedItem.cycle_day,
      parsedItem.period_day ? 1 : 0,
      JSON.stringify(parsedItem.symptoms),
      parsedItem.mood || null,
      parsedItem.notes || null,
      parsedItem.flow_intensity || null,
      parsedItem.id
    ];

    try {
      await this.db.executeQuery(query, params);
    } catch (error) {
      console.error('Error updating cycle record:', error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    const query = 'DELETE FROM cycle_records WHERE id = ?';
    const params = [id];

    try {
      await this.db.executeQuery(query, params);
    } catch (error) {
      console.error('Error deleting cycle record:', error);
      throw error;
    }
  }

  async getByDate(date: string): Promise<CycleRecord | null> {
    const query = 'SELECT * FROM cycle_records WHERE date = ?';
    const params = [date];
    
    try {
      const results = await this.db.executeQuery<any>(query, params);
      if (results.length === 0) {
        return null;
      }
      
      return this.mapToCycleRecord(results[0]);
    } catch (error) {
      console.error('Error getting cycle record by date:', error);
      throw error;
    }
  }

  async getByDateRange(startDate: string, endDate: string): Promise<CycleRecord[]> {
    const query = 'SELECT * FROM cycle_records WHERE date BETWEEN ? AND ? ORDER BY date ASC';
    const params = [startDate, endDate];
    
    try {
      const results = await this.db.executeQuery<any>(query, params);
      return results.map(row => this.mapToCycleRecord(row));
    } catch (error) {
      console.error('Error getting cycle records by date range:', error);
      throw error;
    }
  }

  async getByPeriodDay(isPeriodDay: boolean): Promise<CycleRecord[]> {
    const query = 'SELECT * FROM cycle_records WHERE period_day = ? ORDER BY date DESC';
    const params = [isPeriodDay ? 1 : 0];
    
    try {
      const results = await this.db.executeQuery<any>(query, params);
      return results.map(row => this.mapToCycleRecord(row));
    } catch (error) {
      console.error('Error getting cycle records by period day:', error);
      throw error;
    }
  }

  async getByCycleId(cycleId: number): Promise<CycleRecord[]> {
    // Предполагаем, что в будущем добавим поле cycle_id к записям
    // Сейчас просто возвращаем пустой массив
    return [];
  }

  async deleteByDateRange(startDate: string, endDate: string): Promise<void> {
    const query = 'DELETE FROM cycle_records WHERE date BETWEEN ? AND ?';
    const params = [startDate, endDate];

    try {
      await this.db.executeQuery(query, params);
    } catch (error) {
      console.error('Error deleting cycle records by date range:', error);
      throw error;
    }
  }

  private mapToCycleRecord(row: any): CycleRecord {
    return {
      id: row.id,
      date: row.date,
      cycle_day: row.cycle_day,
      period_day: Boolean(row.period_day),
      symptoms: row.symptoms ? JSON.parse(row.symptoms) : [],
      mood: row.mood || undefined,
      notes: row.notes || undefined,
      flow_intensity: row.flow_intensity || undefined,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }
}
```

## 5. Пример реализации репозитория для настроек

```typescript
// src/data/repositories/SettingsRepositoryImpl.ts
import { SettingsRepositoryContract } from '../contracts/SettingsRepositoryContract';
import { AppSettings } from '../models/AppSettings';
import { AsyncStorageProvider } from '../local/AsyncStorageProvider';
import { z } from 'zod';

// Валидационная схема для AppSettings
const appSettingsSchema = z.object({
  notification_settings: z.object({
    enable_period_reminders: z.boolean(),
    period_reminder_time: z.string(),
    enable_ovulation_reminders: z.boolean(),
    ovulation_reminder_time: z.string(),
    enable_general_reminders: z.boolean()
  }),
  app_preferences: z.object({
    theme: z.enum(['light', 'dark', 'system']),
    language: z.string(),
    first_day_of_week: z.number().int().min(0).max(6)
  }),
  cycle_preferences: z.object({
    average_cycle_length: z.number().int().positive(),
    average_period_length: z.number().int().positive(),
    last_period_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').nullable(),
    pregnancy_goal: z.enum(['trying', 'avoiding', 'none'])
  })
});

export class SettingsRepositoryImpl implements SettingsRepositoryContract {
  private storage = AsyncStorageProvider.getInstance();
  private readonly SETTINGS_KEY = 'app_settings';

  async getAll(): Promise<AppSettings> {
    try {
      const settingsString = await this.storage.getItem(this.SETTINGS_KEY);
      
      if (!settingsString) {
        // Возвращаем настройки по умолчанию
        return this.getDefaultSettings();
      }
      
      const parsedSettings = JSON.parse(settingsString);
      
      // Валидируем полученные настройки
      const validatedSettings = appSettingsSchema.parse(parsedSettings);
      
      return validatedSettings;
    } catch (error) {
      console.error('Error getting all settings:', error);
      // Возвращаем настройки по умолчанию в случае ошибки
      return this.getDefaultSettings();
    }
  }

  async save(settings: AppSettings): Promise<void> {
    try {
      // Валидируем настройки перед сохранением
      const validatedSettings = appSettingsSchema.parse(settings);
      
      const settingsString = JSON.stringify(validatedSettings);
      await this.storage.setItem(this.SETTINGS_KEY, settingsString);
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }

  async update(partialSettings: Partial<AppSettings>): Promise<void> {
    try {
      const currentSettings = await this.getAll();
      const updatedSettings = { ...currentSettings, ...partialSettings };
      
      // Валидируем обновленные настройки
      const validatedSettings = appSettingsSchema.parse(updatedSettings);
      
      await this.save(validatedSettings);
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  }

  async getSetting<T>(key: keyof AppSettings): Promise<T | undefined> {
    try {
      const settings = await this.getAll();
      return settings[key] as T;
    } catch (error) {
      console.error(`Error getting setting ${key}:`, error);
      return undefined;
    }
  }

  async setSetting<T>(key: keyof AppSettings, value: T): Promise<void> {
    try {
      const partialSettings = { [key]: value } as Partial<AppSettings>;
      await this.update(partialSettings);
    } catch (error) {
      console.error(`Error setting ${key}:`, error);
      throw error;
    }
  }

  async resetToDefaults(): Promise<void> {
    try {
      await this.storage.removeItem(this.SETTINGS_KEY);
    } catch (error) {
      console.error('Error resetting settings to defaults:', error);
      throw error;
    }
  }

  private getDefaultSettings(): AppSettings {
    return {
      notification_settings: {
        enable_period_reminders: true,
        period_reminder_time: '08:00',
        enable_ovulation_reminders: true,
        ovulation_reminder_time: '08:00',
        enable_general_reminders: true
      },
      app_preferences: {
        theme: 'system',
        language: 'en',
        first_day_of_week: 1 // Monday
      },
      cycle_preferences: {
        average_cycle_length: 28,
        average_period_length: 5,
        last_period_start: null,
        pregnancy_goal: 'none'
      }
    };
  }
}
```

## 6. Пример корневого файла экспорта

```typescript
// src/data/index.ts
// Провайдеры
export { SQLiteProvider } from './local/SQLiteProvider';
export { AsyncStorageProvider } from './local/AsyncStorageProvider';

// Модели
export type { CycleRecord } from './models/CycleRecord';
export type { CycleHistory } from './models/CycleHistory';
export type { StatisticsData } from './models/StatisticsData';
export type { AppSettings } from './models/AppSettings';

// Интерфейсы репозиториев
export type { BaseRepositoryContract } from './contracts/BaseRepositoryContract';
export type { CycleRepositoryContract } from './contracts/CycleRepositoryContract';
export type { CycleHistoryRepositoryContract } from './contracts/CycleHistoryRepositoryContract';
export type { StatsRepositoryContract } from './contracts/StatsRepositoryContract';
export type { SettingsRepositoryContract } from './contracts/SettingsRepositoryContract';

// Реализации репозиториев
export { CycleRepositoryImpl } from './repositories/CycleRepositoryImpl';
export { CycleHistoryRepositoryImpl } from './repositories/CycleHistoryRepositoryImpl';
export { StatsRepositoryImpl } from './repositories/StatsRepositoryImpl';
export { SettingsRepositoryImpl } from './repositories/SettingsRepositoryImpl';
```

## 7. Пример использования в сервисах

```typescript
// src/services/CycleService.ts
import { CycleRepositoryImpl } from '../data/repositories/CycleRepositoryImpl';
import { CycleRecord } from '../data/models/CycleRecord';

export class CycleService {
  private repository = new CycleRepositoryImpl();

  async addCycleRecord(record: Omit<CycleRecord, 'id'>): Promise<CycleRecord> {
    // Добавляем логику бизнес-валидации
    if (!this.isValidDate(record.date)) {
      throw new Error('Invalid date format');
    }

    // Сохраняем запись
    await this.repository.save(record);

    // Возвращаем полную запись с ID
    const savedRecord = await this.repository.getByDate(record.date);
    if (!savedRecord) {
      throw new Error('Failed to retrieve saved record');
    }

    return savedRecord;
  }

  async getRecordsForPeriod(startDate: string, endDate: string): Promise<CycleRecord[]> {
    return await this.repository.getByDateRange(startDate, endDate);
  }

  private isValidDate(dateString: string): boolean {
    // Проверяем формат даты YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) {
      return false;
    }

    // Проверяем, является ли это действительной датой
    const date = new Date(dateString);
    return date.toISOString().split('T')[0] === dateString;
  }
}