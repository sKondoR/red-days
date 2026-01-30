// src/data/migrations/001-initial-schema.ts
import { SQLiteProvider } from '../local/SQLiteProvider';

export class Migration001InitialSchema {
  static async up(): Promise<void> {
    // Schema is already created in SQLiteProvider initialization
    // This migration ensures the initial schema exists
    const db = SQLiteProvider.getDatabase();
    
    // Create tables if they don't exist
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS cycle_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        date TEXT NOT NULL,
        cycle_day INTEGER NOT NULL,
        symptoms TEXT,
        notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS cycle_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        start_date TEXT,
        end_date TEXT,
        average_length INTEGER DEFAULT 28,
        next_expected_date TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS statistics_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        cycle_count INTEGER DEFAULT 0,
        average_cycle_length REAL DEFAULT 28.0,
        shortest_cycle INTEGER DEFAULT 21,
        longest_cycle INTEGER DEFAULT 35,
        average_period_days REAL DEFAULT 5.0,
        prediction_accuracy REAL DEFAULT 0.0,
        symptom_frequency TEXT,
        fertility_window_start TEXT,
        fertility_window_end TEXT,
        last_updated TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS app_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        theme TEXT DEFAULT 'auto',
        notifications_enabled BOOLEAN DEFAULT 1,
        reminder_time TEXT DEFAULT '08:00',
        units TEXT DEFAULT 'metric',
        language TEXT DEFAULT 'en',
        privacy_mode BOOLEAN DEFAULT 0,
        data_sync_enabled BOOLEAN DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
  }

  static async down(): Promise<void> {
    // Rollback the initial schema
    const db = SQLiteProvider.getDatabase();
    
    await db.execAsync(`
      DROP TABLE IF EXISTS cycle_records;
      DROP TABLE IF EXISTS cycle_history;
      DROP TABLE IF EXISTS statistics_data;
      DROP TABLE IF EXISTS app_settings;
    `);
  }
}