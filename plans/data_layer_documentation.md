# Документация по использованию слоя данных

## 1. Обзор архитектуры

Слой данных приложения состоит из следующих компонентов:

- **Модели данных** - определяют структуру данных
- **Интерфейсы репозиториев** - определяют контракты для работы с данными
- **Реализации репозиториев** - конкретные реализации интерфейсов
- **Локальные провайдеры** - абстракции для работы с SQLite и AsyncStorage

Слой данных расположен в директории `src/data/` и предоставляет унифицированный интерфейс для работы с различными источниками данных.

## 2. Использование репозиториев

### 2.1. Импорт репозиториев

```typescript
import { 
  CycleRepositoryImpl, 
  SettingsRepositoryImpl 
} from '../data';
```

### 2.2. Работа с записями цикла

```typescript
// Создание экземпляра репозитория
const cycleRepository = new CycleRepositoryImpl();

// Сохранение новой записи
await cycleRepository.save({
  date: '2023-10-15',
  cycle_day: 1,
  period_day: true,
  symptoms: ['cramps', 'headache'],
  mood: 3,
  notes: 'First day of period'
});

// Получение записи по дате
const record = await cycleRepository.getByDate('2023-10-15');

// Получение записей за период
const records = await cycleRepository.getByDateRange('2023-10-01', '2023-10-31');
```

### 2.3. Работа с настройками

```typescript
// Создание экземпляра репозитория
const settingsRepository = new SettingsRepositoryImpl();

// Получение всех настроек
const settings = await settingsRepository.getAll();

// Обновление части настроек
await settingsRepository.update({
  notification_settings: {
    enable_period_reminders: false,
    period_reminder_time: '09:00'
  }
});

// Установка конкретной настройки
await settingsRepository.setSetting('app_preferences.theme', 'dark');
```

## 3. Интеграция с бизнес-логикой

### 3.1. Создание сервиса для работы с циклами

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
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) {
      return false;
    }

    const date = new Date(dateString);
    return date.toISOString().split('T')[0] === dateString;
  }
}
```

### 3.2. Использование в компонентах React

```typescript
// src/screens/CycleTrackerScreen.tsx
import React, { useState, useEffect } from 'react';
import { CycleService } from '../services/CycleService';
import { CycleRecord } from '../data/models/CycleRecord';

export default function CycleTrackerScreen() {
  const [records, setRecords] = useState<CycleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const cycleService = new CycleService();

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      const data = await cycleService.getRecordsForPeriod(
        '2023-10-01', 
        '2023-10-31'
      );
      setRecords(data);
    } catch (error) {
      console.error('Error loading records:', error);
    } finally {
      setLoading(false);
    }
  };

  // ... остальная логика компонента
}
```

## 4. Обработка ошибок

Все репозитории выбрасывают исключения при ошибках, которые должны быть обработаны на уровне бизнес-логики:

```typescript
try {
  await cycleRepository.save(record);
} catch (error) {
  console.error('Error saving cycle record:', error);
  // Обработка ошибки (например, показ уведомления пользователю)
}
```

## 5. Тестирование слоя данных

### 5.1. Мокирование репозиториев

Благодаря использованию интерфейсов, легко создавать моки для тестирования:

```typescript
// __mocks__/CycleRepositoryMock.ts
import { CycleRepositoryContract } from '../data/contracts/CycleRepositoryContract';
import { CycleRecord } from '../data/models/CycleRecord';

export class CycleRepositoryMock implements CycleRepositoryContract {
  private records: CycleRecord[] = [];

  async save(item: CycleRecord): Promise<void> {
    if (item.id) {
      const index = this.records.findIndex(r => r.id === item.id);
      if (index !== -1) {
        this.records[index] = item;
      }
    } else {
      const newRecord = { ...item, id: this.records.length + 1 };
      this.records.push(newRecord);
    }
  }

  async getById(id: number): Promise<CycleRecord | null> {
    const record = this.records.find(r => r.id === id);
    return record || null;
  }

  // ... реализация остальных методов
}
```

### 5.2. Тестирование сервисов

```typescript
// __tests__/CycleService.test.ts
import { CycleService } from '../services/CycleService';
import { CycleRepositoryMock } from '../__mocks__/CycleRepositoryMock';

describe('CycleService', () => {
  let service: CycleService;
  let mockRepository: CycleRepositoryMock;

  beforeEach(() => {
    mockRepository = new CycleRepositoryMock();
    service = new CycleService(mockRepository);
  });

  it('should add a new cycle record', async () => {
    const newRecord = {
      date: '2023-10-15',
      cycle_day: 1,
      period_day: true,
      symptoms: ['cramps'],
    };

    const result = await service.addCycleRecord(newRecord);

    expect(result.id).toBeDefined();
    expect(result.date).toBe('2023-10-15');
  });
});
```

## 6. Миграции базы данных

При изменении схемы базы данных необходимо создавать миграции:

```typescript
// src/data/migrations/002-add-mood-rating.ts
import { SQLiteProvider } from '../local/SQLiteProvider';

export async function migrate(): Promise<void> {
  const db = SQLiteProvider.getInstance();
  
  // Добавляем колонку mood_rating к существующей таблице
  await db.executeQuery(`
    ALTER TABLE cycle_records 
    ADD COLUMN mood_rating INTEGER DEFAULT NULL
  `);
}
```

## 7. Производительность и оптимизация

### 7.1. Пакетные операции

Для выполнения нескольких операций используйте транзакции:

```typescript
// Внутри репозитория
async bulkInsert(records: CycleRecord[]): Promise<void> {
  const db = SQLiteProvider.getInstance();
  
  db.getDatabase().transaction(tx => {
    for (const record of records) {
      tx.executeSql(
        'INSERT INTO cycle_records (...) VALUES (...)',
        [/* параметры */]
      );
    }
  });
}
```

### 7.2. Индексы

Добавляйте индексы для часто используемых полей:

```sql
-- В миграциях
CREATE INDEX idx_cycle_records_date ON cycle_records(date);
CREATE INDEX idx_cycle_records_period_day ON cycle_records(period_day);
```

## 8. Безопасность

### 8.1. Валидация данных

Все данные проходят валидацию через Zod перед сохранением:

```typescript
// В репозитории
const parsedItem = cycleRecordSchema.parse(item);
```

### 8.2. Санитизация

Все параметры SQL запросов передаются через параметры, а не конкатенацией строк:

```typescript
// Правильно
tx.executeSql('SELECT * FROM table WHERE id = ?', [id]);

// Неправильно
tx.executeSql(`SELECT * FROM table WHERE id = ${id}`);
```

## 9. Отладка

### 9.1. Логирование

Для отладки можно добавить логирование в репозитории:

```typescript
async getById(id: number): Promise<T | null> {
  console.log(`Getting item with ID: ${id}`);
  
  try {
    // ... основная логика
  } catch (error) {
    console.error(`Error getting item with ID ${id}:`, error);
    throw error;
  }
}
```

### 9.2. Инструменты разработки

Используйте инструменты разработки Expo для просмотра содержимого базы данных и AsyncStorage.

## 10. Рекомендации по обслуживанию

1. При добавлении новых полей в модели данных создавайте миграции базы данных
2. Используйте транзакции для группировки связанных операций
3. Всегда обрабатывайте ошибки на уровне бизнес-логики
4. Регулярно очищайте устаревшие данные при необходимости
5. Проводите тестирование после изменений в слое данных