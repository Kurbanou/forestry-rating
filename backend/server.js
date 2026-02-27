const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

// Подключение к PostgreSQL
const pool = new Pool({
  user: "admin",
  password: "mypassword",
  host: "localhost",
  port: 5432,
  database: "forestry_rating",
});

// Секретный ключ для JWT
const JWT_SECRET = "your-secret-key-123";

// Регистрация
app.post("/api/register", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Проверяем, существует ли пользователь
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "Пользователь уже существует" });
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаем пользователя
    const result = await pool.query(
      "INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id, email, role",
      [email, hashedPassword, role || "viewer"],
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Вход
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Ищем пользователя
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ error: "Пользователь не найден" });
    }

    // Проверяем пароль
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ error: "Неверный пароль" });
    }

    // Создаем JWT токен
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Получение данных пользователя по токену
app.get("/api/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Не авторизован" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const result = await pool.query(
      "SELECT id, email, role FROM users WHERE id = $1",
      [decoded.id],
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(401).json({ error: "Не авторизован" });
  }
});

// Получение всех показателей
app.get("/api/indicators", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT i.*, s.name as section_name 
      FROM indicators i
      JOIN sections s ON i.section_id = s.id
      WHERE i.is_active = true
      ORDER BY s.sort_order, i.id
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Получение разделов
app.get("/api/sections", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM sections ORDER BY sort_order",
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Получение лесничеств
app.get("/api/forestries", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM forestries ORDER BY id");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Получение данных за период (простой вариант)
app.get("/api/raw-data", async (req, res) => {
  try {
    const { period } = req.query;

    console.log("Запрос raw-data с period:", period);

    let query = "SELECT * FROM raw_data";
    let params = [];

    if (period) {
      // Простой вариант - ищем по началу строки
      query += " WHERE period::text LIKE $1";
      params = [`${period}%`];
    }

    query += " ORDER BY period, forestry_id, indicator_id";

    console.log("SQL:", query, params);

    const result = await pool.query(query, params);
    console.log("Найдено записей:", result.rows.length);

    res.json(result.rows);
  } catch (error) {
    console.error("ОШИБКА в raw-data:", error);
    res.status(500).json({ error: error.message });
  }
});

// Добавление/обновление данных
app.post("/api/raw-data", async (req, res) => {
  try {
    const { forestry_id, indicator_id, value, period } = req.body;
    const token = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const fullPeriod = `${period}-01`;

    // Проверяем, есть ли уже запись
    const existing = await pool.query(
      "SELECT * FROM raw_data WHERE forestry_id = $1 AND indicator_id = $2 AND period = $3",
      [forestry_id, indicator_id, fullPeriod],
    );

    if (existing.rows.length > 0) {
      // Обновляем
      await pool.query(
        "UPDATE raw_data SET value = $1, updated_at = NOW() WHERE id = $2",
        [value, existing.rows[0].id],
      );
    } else {
      // Создаем новую
      await pool.query(
        "INSERT INTO raw_data (forestry_id, indicator_id, value, period, created_by) VALUES ($1, $2, $3, $4, $5)",
        [forestry_id, indicator_id, value, fullPeriod, decoded.id],
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Запуск сервера
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
