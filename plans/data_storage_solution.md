# План реализации системы хранения данных

## 1. Сравнение AsyncStorage vs SQLite

### AsyncStorage
#### Преимущества:
- Простота использования для хранения небольших объемов данных
- Подходит для хранения настроек, предпочтений пользователя, токенов авторизации
- Асинхронное API
- Легко интегрируется с React Native

#### Недостатки:
- Не подходит для сложных структур данных
- Ограниченные возможности поиска и фильтрации
- Неэффективен для хранения больших объемов данных
- Нет поддержки транзакций
- Отсутствие типизации данных

### SQLite
#### Преимущества:
- Подходит для хранения сложных структур данных
- Поддержка SQL запросов для поиска, фильтрации и сортировки
- Поддержка транзакций
- Эффективен для работы с большими объемами данных
- Возможность создания связей между таблицами
- Лучшая производительность для сложных запросов

#### Недостатки:
- Более сложная настройка и использование
- Требует знания SQL
- Больше кода для реализации CRUD операций

## 2. Рекомендации по использованию

На основе анализа функциональных требований приложения, рекомендуется использовать гибридный подход:

### AsyncStorage для:
- Настроек приложения (уведомления, тема и т.д.)
- Временных данных сессии
- Предпочтений пользователя
- Токенов аутентификации

### SQLite для:
- Хранения истории менструального цикла
- Заметок к дням
- Статистических данных
- Настроек, связанных с циклом

## 3. Выбор библиотек

### Для AsyncStorage:
- [@react-native-async-storage/async-storage](https://github.com/react-native-async-storage/async-storage) - официальная библиотека для React Native

### Для SQLite:
- [expo-sqlite](https://docs.expo.io/versions/latest/sdk/sqlite/) - официальная библиотека Expo для работы с SQLite
- Поддерживает все преимущества SQLite в экосистеме Expo
- Хорошо документирована и активно поддерживается

## 4. Архитектурное решение

### Структура слоя данных:
```
src/
├── data/
│   ├── models/           # Модели данных
│   ├── repositories/     # Репозитории для каждого типа данных
│   ├── local/            # Локальные провайдеры (AsyncStorage, SQLite)
│   └── contracts/        # Интерфейсы репозиториев
```

### Модели данных:
- `CycleRecord` - запись о дне цикла
- `CycleStats` - статистические данные
- `AppSettings` - настройки приложения

### Репозитории:
- `CycleRepository` - работа с записями цикла (использует SQLite)
- `StatsRepository` - работа со статистикой (использует SQLite)
- `SettingsRepository` - работа с настройками (использует AsyncStorage)

## 5. Пример реализации

### Интерфейс репозитория
```typescript
// src/data/contracts/CycleRepositoryContract.ts
export interface CycleRepositoryContract {
  save(record: CycleRecord): Promise<void>;
  getByDate(date: Date): Promise<CycleRecord | null>;
  getAll(from: Date, to: Date): Promise<CycleRecord[]>;
  update(record: CycleRecord): Promise<void>;
  delete(id: number): Promise<void>;
}
```

### Реализация через SQLite
```typescript
// src/data/repositories/CycleRepositoryImpl.ts
import * as SQLite from 'expo-sqlite';
import { CycleRepositoryContract } from '../contracts/CycleRepositoryContract';
import { CycleRecord } from '../models/CycleRecord';

const db = SQLite.openDatabase('cycle.db');

export class CycleRepositoryImpl implements CycleRepositoryContract {
  // Реализация методов
}
```

### Реализация через AsyncStorage
```typescript
// src/data/repositories/SettingsRepositoryImpl.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SettingsRepositoryContract } from '../contracts/SettingsRepositoryContract';

export class SettingsRepositoryImpl implements SettingsRepositoryContract {
  // Реализация методов
}
```

## 6. План внедрения

1. Установить необходимые зависимости
2. Создать структуру папок для слоя данных
3. Определить модели данных
4. Создать интерфейсы репозиториев
5. Реализовать репозитории
6. Написать тесты для проверки работоспособности
7. Интегрировать с бизнес-логикой приложения