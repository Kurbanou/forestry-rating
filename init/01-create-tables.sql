-- Таблица лесничеств
CREATE TABLE IF NOT EXISTS forestries (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица пользователей (для хранения ролей)
-- В Supabase это будет auth.users, но для начала создадим простую таблицу
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'viewer' CHECK (role IN ('admin', 'engineer', 'viewer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица разделов
CREATE TABLE IF NOT EXISTS sections (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sort_order INTEGER DEFAULT 0
);

-- Таблица показателей
CREATE TABLE IF NOT EXISTS indicators (
    id SERIAL PRIMARY KEY,
    section_id INTEGER REFERENCES sections(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    max_weight INTEGER NOT NULL,
    unit TEXT DEFAULT 'га',
    description TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Таблица ответственных за показатели
CREATE TABLE IF NOT EXISTS indicator_responsible (
    id SERIAL PRIMARY KEY,
    indicator_id INTEGER REFERENCES indicators(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    assigned_by INTEGER REFERENCES users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(indicator_id, user_id)
);

-- Таблица данных
CREATE TABLE IF NOT EXISTS raw_data (
    id SERIAL PRIMARY KEY,
    forestry_id INTEGER REFERENCES forestries(id) ON DELETE CASCADE,
    indicator_id INTEGER REFERENCES indicators(id) ON DELETE CASCADE,
    value DECIMAL(10,2) NOT NULL DEFAULT 0,
    period DATE NOT NULL DEFAULT CURRENT_DATE,
    created_by INTEGER REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(forestry_id, indicator_id, period)
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_raw_data_period ON raw_data(period);
CREATE INDEX IF NOT EXISTS idx_raw_data_indicator ON raw_data(indicator_id);
CREATE INDEX IF NOT EXISTS idx_indicators_section ON indicators(section_id);

-- Начальные данные
INSERT INTO forestries (name) VALUES 
    ('Северное'), ('Южное'), ('Западное'), ('Восточное'), ('Центральное')
ON CONFLICT DO NOTHING;

-- Создаем тестового админа (пароль: admin123)
INSERT INTO users (email, password, role) VALUES 
    ('admin@example.com', 'admin123', 'admin')
ON CONFLICT DO NOTHING;

-- Создаем тестового инженера
INSERT INTO users (email, password, role) VALUES 
    ('engineer@example.com', 'engineer123', 'engineer')
ON CONFLICT DO NOTHING;

-- Создаем разделы
INSERT INTO sections (name, description, sort_order) VALUES 
    ('Лесохозяйственные работы', 'Рубки ухода, посадка леса и другие работы', 1),
    ('Охрана леса', 'Противопожарные мероприятия, защита от вредителей', 2),
    ('Восстановление леса', 'Сбор семян, выращивание саженцев', 3)
ON CONFLICT DO NOTHING;

-- Создаем показатели
INSERT INTO indicators (section_id, name, max_weight, unit, description) VALUES 
    (1, 'Рубки ухода', 80, 'га', 'Площадь рубок ухода за молодняками'),
    (1, 'Посадка леса', 100, 'га', 'Площадь посадки лесных культур'),
    (2, 'Устройство минполос', 60, 'км', 'Протяженность минерализованных полос'),
    (3, 'Сбор семян', 40, 'кг', 'Объем заготовленных лесных семян')
ON CONFLICT DO NOTHING;