# Структура моделей данных для приложения

## 1. Описание моделей

### 1.1. CycleRecord (Запись о дне цикла)
Хранится в SQLite

Поля:
- id: number (PRIMARY KEY, AUTOINCREMENT)
- date: string (формат YYYY-MM-DD)
- cycle_day: number (номер дня в текущем цикле)
- period_day: boolean (является ли днем менструации)
- symptoms: string[] (симптомы в JSON формате)
- mood: number (настроение от 1 до 5)
- notes: string (заметки пользователя)
- flow_intensity: number (интенсивность потока: 1-5)
- created_at: string (дата создания записи)
- updated_at: string (дата последнего изменения)

### 1.2. CycleHistory (История цикла)
Хранится в SQLite

Поля:
- id: number (PRIMARY KEY, AUTOINCREMENT)
- start_date: string (дата начала цикла)
- end_date: string (дата окончания цикла)
- cycle_length: number (длина цикла в днях)
- period_length: number (длина менструации в днях)
- average_cycle_length: number (средняя длина цикла)
- predicted_ovulation_date: string (предполагаемая дата овуляции)
- created_at: string (дата создания записи)
- updated_at: string (дата последнего изменения)

### 1.3. AppSettings (Настройки приложения)
Хранится в AsyncStorage

Структура:
```json
{
  "notification_settings": {
    "enable_period_reminders": boolean,
    "period_reminder_time": string,
    "enable_ovulation_reminders": boolean,
    "ovulation_reminder_time": string,
    "enable_general_reminders": boolean
  },
  "app_preferences": {
    "theme": "light" | "dark" | "system",
    "language": string,
    "first_day_of_week": number
  },
  "cycle_preferences": {
    "average_cycle_length": number,
    "average_period_length": number,
    "last_period_start": string,
    "pregnancy_goal": "trying" | "avoiding" | "none"
  }
}
```

### 1.4. StatisticsData (Статистические данные)
Хранится в SQLite

Поля:
- id: number (PRIMARY KEY, AUTOINCREMENT)
- cycle_id: number (ссылка на CycleHistory)
- avg_cycle_length: number,
- avg_period_length: number,
- ovulation_patterns: string (паттерны овуляции в JSON),
- fertile_window_start: string,
- fertile_window_end: string,
- pregnancy_probability: number,
- calculated_at: string (дата последнего пересчета статистики)

## 2. Связи между таблицами

### SQLite:
- `CycleHistory.id` → `StatisticsData.cycle_id` (один ко многим)
- `CycleHistory.start_date` → `CycleRecord.date` (через период)

## 3. SQL схема таблиц

### Таблица cycle_records:
```sql
CREATE TABLE IF NOT EXISTS cycle_records (
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
);
```

### Таблица cycle_histories:
```sql
CREATE TABLE IF NOT EXISTS cycle_histories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  start_date TEXT NOT NULL UNIQUE,
  end_date TEXT,
  cycle_length INTEGER,
  period_length INTEGER,
  average_cycle_length REAL,
  predicted_ovulation_date TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### Таблица statistics_data:
```sql
CREATE TABLE IF NOT EXISTS statistics_data (
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
);
```

## 4. Валидация данных

Все модели данных должны проходить валидацию перед сохранением:

- Даты должны быть в формате YYYY-MM-DD
- Числовые значения должны быть в допустимом диапазоне
- Симптомы и заметки не должны превышать допустимый размер
- Проверка целостности связей между таблицами