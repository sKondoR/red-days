# Интерфейсы репозиториев для слоя данных

## 1. Общие принципы

Все репозитории должны реализовывать асинхронные методы и возвращать Promise. Каждый репозиторий отвечает за работу с одной сущностью данных.

## 2. Интерфейсы

### 2.1. Базовый интерфейс репозитория
```typescript
export interface BaseRepository<T> {
  /**
   * Сохраняет объект в хранилище
   */
  save(item: T): Promise<void>;

  /**
   * Получает объект по ID
   */
  getById(id: number): Promise<T | null>;

  /**
   * Получает все объекты
   */
  getAll(): Promise<T[]>;

  /**
   * Обновляет объект в хранилище
   */
  update(item: T): Promise<void>;

  /**
   * Удаляет объект по ID
   */
  delete(id: number): Promise<void>;
}
```

### 2.2. Интерфейс репозитория записей цикла
```typescript
import { CycleRecord } from '../models/CycleRecord';

export interface CycleRepositoryContract extends BaseRepository<CycleRecord> {
  /**
   * Получает запись по дате
   */
  getByDate(date: string): Promise<CycleRecord | null>;

  /**
   * Получает записи в диапазоне дат
   */
  getByDateRange(startDate: string, endDate: string): Promise<CycleRecord[]>;

  /**
   * Получает записи по типу дня (менструация или нет)
   */
  getByPeriodDay(isPeriodDay: boolean): Promise<CycleRecord[]>;

  /**
   * Получает все записи за определенный цикл
   */
  getByCycleId(cycleId: number): Promise<CycleRecord[]>;

  /**
   * Удаляет все записи в диапазоне дат
   */
  deleteByDateRange(startDate: string, endDate: string): Promise<void>;
}
```

### 2.3. Интерфейс репозитория истории цикла
```typescript
import { CycleHistory } from '../models/CycleHistory';

export interface CycleHistoryRepositoryContract extends BaseRepository<CycleHistory> {
  /**
   * Получает историю циклов в диапазоне дат
   */
  getByDateRange(startDate: string, endDate: string): Promise<CycleHistory[]>;

  /**
   * Получает последний завершенный цикл
   */
  getLastCompletedCycle(): Promise<CycleHistory | null>;

  /**
   * Получает текущий активный цикл
   */
  getCurrentCycle(): Promise<CycleHistory | null>;

  /**
   * Получает среднюю длину цикла
   */
  getAverageCycleLength(): Promise<number | null>;

  /**
   * Получает среднюю длину менструации
   */
  getAveragePeriodLength(): Promise<number | null>;

  /**
   * Получает дату предполагаемой овуляции для последнего цикла
   */
  getLastPredictedOvulationDate(): Promise<string | null>;
}
```

### 2.4. Интерфейс репозитория статистики
```typescript
import { StatisticsData } from '../models/StatisticsData';

export interface StatsRepositoryContract extends BaseRepository<StatisticsData> {
  /**
   * Получает статистику по ID цикла
   */
  getByCycleId(cycleId: number): Promise<StatisticsData | null>;

  /**
   * Получает последнюю рассчитанную статистику
   */
  getLastCalculatedStats(): Promise<StatisticsData | null>;

  /**
   * Обновляет статистику по ID цикла
   */
  updateByCycleId(cycleId: number, stats: StatisticsData): Promise<void>;

  /**
   * Пересчитывает всю статистику
   */
  recalculateAll(): Promise<void>;
}
```

### 2.5. Интерфейс репозитория настроек
```typescript
import { AppSettings } from '../models/AppSettings';

export interface SettingsRepositoryContract {
  /**
   * Получает все настройки
   */
  getAll(): Promise<AppSettings>;

  /**
   * Сохраняет все настройки
   */
  save(settings: AppSettings): Promise<void>;

  /**
   * Обновляет часть настроек
   */
  update(partialSettings: Partial<AppSettings>): Promise<void>;

  /**
   * Получает конкретную настройку
   */
  getSetting<T>(key: keyof AppSettings): Promise<T | undefined>;

  /**
   * Устанавливает конкретную настройку
   */
  setSetting<T>(key: keyof AppSettings, value: T): Promise<void>;

  /**
   * Сбрасывает все настройки к значениям по умолчанию
   */
  resetToDefaults(): Promise<void>;
}
```

## 3. Структура файлов

```
src/data/contracts/
├── BaseRepositoryContract.ts
├── CycleRepositoryContract.ts
├── CycleHistoryRepositoryContract.ts
├── StatsRepositoryContract.ts
└── SettingsRepositoryContract.ts
```

## 4. Пример реализации контракта

```typescript
// src/data/contracts/CycleRepositoryContract.ts
import { CycleRecord } from '../models/CycleRecord';
import { BaseRepositoryContract } from './BaseRepositoryContract';

export interface CycleRepositoryContract extends BaseRepositoryContract<CycleRecord> {
  getByDate(date: string): Promise<CycleRecord | null>;
  getByDateRange(startDate: string, endDate: string): Promise<CycleRecord[]>;
  getByPeriodDay(isPeriodDay: boolean): Promise<CycleRecord[]>;
  getByCycleId(cycleId: number): Promise<CycleRecord[]>;
  deleteByDateRange(startDate: string, endDate: string): Promise<void>;
}
```

## 5. Обработка ошибок

Все репозитории должны реализовывать единый подход к обработке ошибок:

- Валидация данных до сохранения
- Обработка ошибок доступа к хранилищу
- Логирование ошибок при необходимости
- Возврат соответствующих ошибок клиентскому коду