const bcrypt = require("bcryptjs");
const { Pool } = require("pg");

const pool = new Pool({
  user: "admin",
  password: "mypassword",
  host: "localhost",
  port: 5432,
  database: "forestry_rating",
});

async function updatePasswords() {
  try {
    // Получаем всех пользователей
    const users = await pool.query("SELECT * FROM users");

    for (const user of users.rows) {
      // Хешируем существующий пароль
      const hashedPassword = await bcrypt.hash(user.password, 10);

      // Обновляем в базе
      await pool.query("UPDATE users SET password = $1 WHERE id = $2", [
        hashedPassword,
        user.id,
      ]);

      console.log(`Обновлен пароль для ${user.email}`);
    }

    console.log("Все пароли обновлены!");
  } catch (error) {
    console.error("Ошибка:", error);
  } finally {
    await pool.end();
  }
}

updatePasswords();
