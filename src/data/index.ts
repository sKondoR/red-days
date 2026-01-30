// src/data/index.ts
// Export all models
export * from './models/CycleRecord';
export * from './models/CycleHistory';
export * from './models/StatisticsData';
export * from './models/AppSettings';

// Export all contracts/interfaces
export * from './contracts/BaseRepositoryContract';
export * from './contracts/CycleRepositoryContract';
export * from './contracts/CycleHistoryRepositoryContract';
export * from './contracts/StatsRepositoryContract';
export * from './contracts/SettingsRepositoryContract';

// Export all repository implementations
export * from './repositories/CycleRepositoryImpl';
export * from './repositories/CycleHistoryRepositoryImpl';
export * from './repositories/StatsRepositoryImpl';
export * from './repositories/SettingsRepositoryImpl';

// Export local providers
export * from './local/SQLiteProvider';
export * from './local/AsyncStorageProvider';

// Export migrations
export * from './migrations/001-initial-schema';

// Export main data layer configuration
export const DataLayerConfig = {
  databaseName: 'reddays.db',
  version: '1.0.0',
  migrations: [
    // Add migration classes here in order
    { version: 1, migration: () => import('./migrations/001-initial-schema') }
  ]
};