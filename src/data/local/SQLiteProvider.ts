// src/data/local/SQLiteProvider.ts
import * as SQLite from 'expo-sqlite';

export class SQLiteProvider {
  private static database: SQLite.SQLiteDatabase | null = null;
  private static readonly DB_NAME = 'reddays.db';

  static getDatabase(): SQLite.SQLiteDatabase {
    if (!this.database) {
      this.database = SQLite.openDatabaseSync(this.DB_NAME);
      this.initializeDatabase();
    }
    return this.database;
  }

  private static initializeDatabase(): void {
    if (this.database) {
      // Create tables if they don't exist
      this.database.execSync(`
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
  }

  static closeDatabase(): void {
    if (this.database) {
      this.database.closeAsync();
      this.database = null;
    }
  }

  static async clearDatabase(): Promise<void> {
    if (this.database) {
      await this.database.execAsync('DROP TABLE IF EXISTS cycle_records;');
      await this.database.execAsync('DROP TABLE IF EXISTS cycle_history;');
      await this.database.execAsync('DROP TABLE IF EXISTS statistics_data;');
      await this.database.execAsync('DROP TABLE IF EXISTS app_settings;');
      
      // Reinitialize the database
      this.initializeDatabase();
    }
  }
}