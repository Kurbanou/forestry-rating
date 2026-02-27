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

// ============ АУТЕНТИФИКАЦИЯ ============

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

// ============ РАЗДЕЛЫ (SECTIONS) ============

// Получение всех разделов
app.get("/api/sections", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM sections ORDER BY sort_order",
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Ошибка получения разделов:", error);
    res.status(500).json({ error: error.message });
  }
});

// Получение раздела по ID
app.get("/api/sections/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM sections WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Раздел не найден" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Ошибка получения раздела:", error);
    res.status(500).json({ error: error.message });
  }
});

// Создание раздела
app.post("/api/sections", async (req, res) => {
  try {
    const { name, description, sort_order } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Не авторизован" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const result = await pool.query(
      "INSERT INTO sections (name, description, sort_order, created_by) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, description, sort_order || 0, decoded.id],
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Ошибка создания раздела:", error);
    res.status(500).json({ error: error.message });
  }
});

// Обновление раздела
app.put("/api/sections/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, sort_order } = req.body;

    const result = await pool.query(
      "UPDATE sections SET name = $1, description = $2, sort_order = $3 WHERE id = $4 RETURNING *",
      [name, description, sort_order, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Раздел не найден" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Ошибка обновления раздела:", error);
    res.status(500).json({ error: error.message });
  }
});

// Удаление раздела
app.delete("/api/sections/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Сначала удаляем связанные показатели
    await pool.query("DELETE FROM indicators WHERE section_id = $1", [id]);

    // Затем удаляем раздел
    const result = await pool.query(
      "DELETE FROM sections WHERE id = $1 RETURNING *",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Раздел не найден" });
    }

    res.json({ success: true, message: "Раздел удален" });
  } catch (error) {
    console.error("Ошибка удаления раздела:", error);
    res.status(500).json({ error: error.message });
  }
});

// ============ ПОКАЗАТЕЛИ (INDICATORS) ============

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
    console.error("Ошибка получения показателей:", error);
    res.status(500).json({ error: error.message });
  }
});

// Получение показателя по ID
app.get("/api/indicators/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM indicators WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Показатель не найден" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Ошибка получения показателя:", error);
    res.status(500).json({ error: error.message });
  }
});

// Создание показателя
app.post("/api/indicators", async (req, res) => {
  try {
    const { section_id, name, max_weight, unit, description, type } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Не авторизован" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const result = await pool.query(
      `INSERT INTO indicators 
       (section_id, name, max_weight, unit, description, type, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        section_id,
        name,
        max_weight,
        unit || "га",
        description,
        type || "positive",
        decoded.id,
      ],
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Ошибка создания показателя:", error);
    res.status(500).json({ error: error.message });
  }
});

// Обновление показателя
app.put("/api/indicators/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { section_id, name, max_weight, unit, description, type } = req.body;

    const result = await pool.query(
      `UPDATE indicators 
       SET section_id = $1, name = $2, max_weight = $3, unit = $4, description = $5, type = $6 
       WHERE id = $7 RETURNING *`,
      [section_id, name, max_weight, unit, description, type, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Показатель не найден" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Ошибка обновления показателя:", error);
    res.status(500).json({ error: error.message });
  }
});

// Удаление показателя (мягкое удаление - деактивация)
app.delete("/api/indicators/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Мягкое удаление - просто деактивируем
    const result = await pool.query(
      "UPDATE indicators SET is_active = false WHERE id = $1 RETURNING *",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Показатель не найден" });
    }

    res.json({ success: true, message: "Показатель деактивирован" });
  } catch (error) {
    console.error("Ошибка удаления показателя:", error);
    res.status(500).json({ error: error.message });
  }
});

// ============ ЛЕСНИЧЕСТВА (FORESTRIES) ============

// Получение всех лесничеств
app.get("/api/forestries", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM forestries ORDER BY id");
    res.json(result.rows);
  } catch (error) {
    console.error("Ошибка получения лесничеств:", error);
    res.status(500).json({ error: error.message });
  }
});

// ============ ДАННЫЕ (RAW_DATA) ============

// Получение данных за период
app.get("/api/raw-data", async (req, res) => {
  try {
    const { period } = req.query;

    let query = "SELECT * FROM raw_data";
    let params = [];

    if (period) {
      query +=
        " WHERE period::text LIKE $1 ORDER BY period, forestry_id, indicator_id";
      params = [`${period}%`];
    } else {
      query += " ORDER BY period, forestry_id, indicator_id";
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Ошибка получения raw-data:", error);
    res.status(500).json({ error: error.message });
  }
});

// Сохранение данных
app.post("/api/raw-data", async (req, res) => {
  try {
    const { forestry_id, indicator_id, value, period } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Не авторизован" });
    }

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
    console.error("Ошибка сохранения raw-data:", error);
    res.status(500).json({ error: error.message });
  }
});

// ============ ОТВЕТСТВЕННЫЕ ЗА ПОКАЗАТЕЛИ ============

// Получение всех ответственных
app.get("/api/indicator-responsible", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT ir.*, u.email as user_email, i.name as indicator_name 
      FROM indicator_responsible ir
      JOIN users u ON ir.user_id = u.id
      JOIN indicators i ON ir.indicator_id = i.id
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Ошибка получения ответственных:", error);
    res.status(500).json({ error: error.message });
  }
});

// Получение ответственных для конкретного показателя
app.get("/api/indicators/:id/responsible", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `
      SELECT ir.*, u.email, u.role 
      FROM indicator_responsible ir
      JOIN users u ON ir.user_id = u.id
      WHERE ir.indicator_id = $1
    `,
      [id],
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Ошибка получения ответственных:", error);
    res.status(500).json({ error: error.message });
  }
});

// Добавление ответственного
app.post("/api/indicators/:id/responsible", async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Не авторизован" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const result = await pool.query(
      `INSERT INTO indicator_responsible (indicator_id, user_id, assigned_by) 
       VALUES ($1, $2, $3) RETURNING *`,
      [id, user_id, decoded.id],
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Ошибка добавления ответственного:", error);
    res.status(500).json({ error: error.message });
  }
});

// Удаление ответственного
app.delete(
  "/api/indicators/:indicatorId/responsible/:userId",
  async (req, res) => {
    try {
      const { indicatorId, userId } = req.params;

      await pool.query(
        "DELETE FROM indicator_responsible WHERE indicator_id = $1 AND user_id = $2",
        [indicatorId, userId],
      );

      res.json({ success: true });
    } catch (error) {
      console.error("Ошибка удаления ответственного:", error);
      res.status(500).json({ error: error.message });
    }
  },
);

// ============ ПОЛЬЗОВАТЕЛИ (USERS) ============

// 1. СНАЧАЛА специфичные маршруты (без параметров)
// Получение всех инженеров
app.get("/api/users/engineers", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, role FROM users WHERE role = 'engineer' ORDER BY email",
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Ошибка получения инженеров:", error);
    res.status(500).json({ error: error.message });
  }
});

// 2. ЗАТЕМ общие маршруты
// Получение всех пользователей
app.get("/api/users", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, role, created_at FROM users ORDER BY id",
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Ошибка получения пользователей:", error);
    res.status(500).json({ error: error.message });
  }
});

// 3. ПОТОМ маршруты с параметрами
// Получение пользователя по ID
app.get("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Проверяем, что id - число
    if (isNaN(id)) {
      return res.status(400).json({ error: "ID должен быть числом" });
    }

    const result = await pool.query(
      "SELECT id, email, role, created_at FROM users WHERE id = $1",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Ошибка получения пользователя:", error);
    res.status(500).json({ error: error.message });
  }
});

// Создание пользователя
app.post("/api/users", async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Не авторизован" });
    }

    // Проверяем, существует ли уже пользователь
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);

    if (existing.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "Пользователь с таким email уже существует" });
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаем пользователя
    const result = await pool.query(
      "INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id, email, role",
      [email, hashedPassword, role],
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Ошибка создания пользователя:", error);
    res.status(500).json({ error: error.message });
  }
});

// Обновление пользователя
app.put("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { email, password, role } = req.body;

    let query;
    let params;

    if (password) {
      // Если передан пароль - хешируем и обновляем
      const hashedPassword = await bcrypt.hash(password, 10);
      query =
        "UPDATE users SET email = $1, password = $2, role = $3 WHERE id = $4 RETURNING id, email, role";
      params = [email, hashedPassword, role, id];
    } else {
      // Без обновления пароля
      query =
        "UPDATE users SET email = $1, role = $2 WHERE id = $3 RETURNING id, email, role";
      params = [email, role, id];
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Ошибка обновления пользователя:", error);
    res.status(500).json({ error: error.message });
  }
});

// Удаление пользователя
app.delete("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Проверяем, не последний ли это администратор
    if (id == 1) {
      return res
        .status(400)
        .json({ error: "Нельзя удалить главного администратора" });
    }

    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING id",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Ошибка удаления пользователя:", error);
    res.status(500).json({ error: error.message });
  }
});

// ============ ЗАПУСК СЕРВЕРА ============
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
