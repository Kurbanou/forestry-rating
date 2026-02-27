# frontend

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

# ============================================

# ПОЛНАЯ ИНСТРУКЦИЯ ПО РАЗВЕРТЫВАНИЮ НА НОВОМ ПК

# ============================================

# 1. Клонировать репозиторий

git clone https://github.com/ВАШ_АККАУНТ/forestry-rating.git
cd forestry-rating

# 2. Установить Docker Desktop с https://www.docker.com/products/docker-desktop/

# Установить Node.js 18+ с https://nodejs.org/

# 3. Запустить базу данных

docker compose up -d
docker ps # Проверить, что контейнер forestry-db запущен

# 4. Восстановить базу данных (если есть backup.sql)

# Если нет - база создастся автоматически из init скриптов

# cat backup.sql | docker exec -i forestry-db psql -U admin -d forestry_rating

# 5. Запустить бэкенд (терминал 1)

cd backend
npm install
npm run dev

# Сервер на http://localhost:3000

# 6. Запустить фронтенд (терминал 2)

cd frontend
npm install
npm run dev

# Фронтенд на http://localhost:5173

# 7. Открыть браузер и войти

# http://localhost:5173

# Логин: admin@les.ru

# Пароль: admin123

# ============================================

# ПОЛЕЗНЫЕ КОМАНДЫ ДЛЯ РАБОТЫ С БАЗОЙ

# ============================================

# Создать бэкап (на старом ПК)

docker exec -t forestry-db pg_dump -U admin forestry_rating > backup.sql

# Восстановить из бэкапа (на новом ПК)

docker exec -i forestry-db psql -U admin -d forestry_rating -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
cat backup.sql | docker exec -i forestry-db psql -U admin -d forestry_rating

# Подключиться к PostgreSQL напрямую

docker exec -it forestry-db psql -U admin -d forestry_rating

# Создать админа вручную (если нет пользователей)

docker exec -it forestry-db psql -U admin -d forestry_rating -c "INSERT INTO users (email, password, role) VALUES ('admin@les.ru', 'admin123', 'admin');"

# Остановить и удалить контейнер с данными (начать заново)

docker compose down -v
docker compose up -d

# ============================================

# ПРОВЕРКА РАБОТОСПОСОБНОСТИ

# ============================================

# Проверить API

curl http://localhost:3000/api/forestries

# Должен вернуться JSON со списком лесничеств

# Проверить логи

docker logs forestry-db

# Или смотреть вывод в терминалах с бэкендом и фронтендом

# ============================================

# ВОЗМОЖНЫЕ ПРОБЛЕМЫ И РЕШЕНИЯ

# ============================================

# Проблема: порт 5432 уже занят

# Решение: изменить порт в docker-compose.yml

# ports:

# - "5433:5432" # вместо 5432:5432

# Проблема: ошибки CORS

# Решение: проверить, что в backend/server.js есть app.use(cors())

# Проблема: не работает авторизация

# Решение: создать админа вручную (команда выше)
