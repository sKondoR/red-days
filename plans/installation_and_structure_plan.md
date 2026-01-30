# План установки зависимостей и создания структуры проекта

## 1. Установка зависимостей

### 1.1. Установка expo-sqlite
```bash
npx expo install expo-sqlite
```

Эта команда установит официальную библиотеку Expo для работы с SQLite, которая поддерживает все возможности SQLite в экосистеме Expo.

### 1.2. Установка @react-native-async-storage/async-storage
```bash
npx expo install @react-native-async-storage/async-storage
```

Эта команда установит официальную библиотеку для асинхронного хранения данных в React Native.

## 2. Создание структуры папок для слоя данных

### 2.1. Создание директории src/data
```
src/data/
├── models/                 # Модели данных
│   ├── CycleRecord.ts
│   ├── CycleHistory.ts
│   ├── StatisticsData.ts
│   └── AppSettings.ts
├── contracts/              # Интерфейсы репозиториев
│   ├── BaseRepositoryContract.ts
│   ├── CycleRepositoryContract.ts
│   ├── CycleHistoryRepositoryContract.ts
│   ├── StatsRepositoryContract.ts
│   └── SettingsRepositoryContract.ts
├── repositories/           # Реализации репозиториев
│   ├── CycleRepositoryImpl.ts
│   ├── CycleHistoryRepositoryImpl.ts
│   ├── StatsRepositoryImpl.ts
│   └── SettingsRepositoryImpl.ts
├── local/                  # Локальные провайдеры
│   ├── SQLiteProvider.ts
│   └── AsyncStorageProvider.ts
├── migrations/             # Миграции базы данных
│   └── 001-initial-schema.ts
└── index.ts                # Экспорт всех компонентов слоя данных
```

### 2.2. Описание файлов

#### Модели (models/)
- `CycleRecord.ts`: Определение интерфейса и класса для записи о дне цикла
- `CycleHistory.ts`: Определение интерфейса и класса для истории цикла
- `StatisticsData.ts`: Определение интерфейса и класса для статистических данных
- `AppSettings.ts`: Определение интерфейса и класса для настроек приложения

#### Контракты (contracts/)
- `BaseRepositoryContract.ts`: Базовый интерфейс для всех репозиториев
- `CycleRepositoryContract.ts`: Интерфейс для работы с записями цикла
- `CycleHistoryRepositoryContract.ts`: Интерфейс для работы с историей циклов
- `StatsRepositoryContract.ts`: Интерфейс для работы со статистикой
- `SettingsRepositoryContract.ts`: Интерфейс для работы с настройками

#### Реализации (repositories/)
- `CycleRepositoryImpl.ts`: Реализация репозитория записей цикла с использованием SQLite
- `CycleHistoryRepositoryImpl.ts`: Реализация репозитория истории циклов с использованием SQLite
- `StatsRepositoryImpl.ts`: Реализация репозитория статистики с использованием SQLite
- `SettingsRepositoryImpl.ts`: Реализация репозитория настроек с использованием AsyncStorage

#### Локальные провайдеры (local/)
- `SQLiteProvider.ts`: Управление подключением к SQLite, выполнение миграций
- `AsyncStorageProvider.ts`: Управление доступом к AsyncStorage с дополнительными возможностями

#### Миграции (migrations/)
- `001-initial-schema.ts`: Создание начальной схемы базы данных

#### Корневой файл (index.ts)
- Экспорт всех компонентов слоя данных для удобного импорта

## 3. Проверка совместимости

Перед установкой зависимостей необходимо убедиться в их совместимости с используемой версией Expo:

- expo-sqlite: Совместим с Expo SDK 54 (используется в проекте)
- @react-native-async-storage/async-storage: Совместим с React Native 0.81.5 (используется в проекте)

## 4. Дополнительные рекомендации

### 4.1. Валидация данных
Для валидации моделей данных рекомендуется использовать библиотеку Zod:

```bash
npx expo install zod
```

### 4.2. Типизация
Все зависимости устанавливаются с TypeScript поддержкой, но при необходимости можно установить отдельные типы:

```bash
npm install --save-dev @types/react-native
```

## 5. Проверка установки

После установки зависимостей необходимо проверить:

1. Что все зависимости указаны в package.json
2. Что можно импортировать модули в TypeScript файлах
3. Что приложение запускается без ошибок
4. Что можно создать подключение к базе данных