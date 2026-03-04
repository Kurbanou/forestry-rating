# 🌲 Forestry Rating System

A comprehensive system for managing and rating forestries based on various performance indicators with automatic score calculation, penalty and bonus systems, and role-based access control.

## 🚀 Technology Stack

- **Frontend**: Vue 3, Pinia, Vite
- **Backend**: Node.js, Express, PostgreSQL
- **Authentication**: JWT, Supabase
- **Hosting**: Vercel, Supabase

## 📋 Key Features

### 👥 User Roles

- **Administrator** - Full system access and management
- **Engineer** - Data entry for assigned indicators
- **Viewer** - Read-only access to all data

### ⚙️ Core Functionalities

- ✅ **Authentication & Authorization** - Secure JWT-based access control
- ✅ **Indicator Management** - Three types available:
  - 📊 **Regular** - Formula-based score calculation
  - ⚠️ **Penalty** - Subtracts points from total
  - 🎁 **Bonus** - Adds points to total
- ✅ **Responsible Assignment** - Assign engineers to specific indicators
- ✅ **Period-based Data Entry** - Monthly data input for forestries
- ✅ **Automatic Score Calculation** - Real-time rating computation
- ✅ **User & Forestry Management** - Full CRUD operations
- ✅ **Statistics Dashboard** - Quarterly comparisons and trend analysis

## 🛠 Installation & Setup

### Prerequisites

- **Docker** (for local PostgreSQL)
- **Node.js 18+** and npm
- **Git**

### Local Development Setup

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/forestry-rating.git
cd forestry-rating

# Start PostgreSQL database
docker compose up -d

# Set up backend
cd backend
npm install
npm run dev
# API available at http://localhost:3000

# Set up frontend (new terminal)
cd frontend
npm install
npm run dev
# App available at http://localhost:5173

# Создать/обновить файл .env
echo "VITE_SUPABASE_URL=https://uckflpnuhycfjcvcppon.supabase.co" > .env
echo "VITE_SUPABASE_ANON_KEY=sb_publishable_20ES7Yy1aTo_TiuVWFqNpg_A_axZF57" >> .env
```

## 🌐 Production Deployment

The project is deployed using modern cloud services:

- **Frontend: Vercel - Automatic deploys from GitHub**
- **Database & Auth: Supabase - PostgreSQL with built-in authentication**

## Live Demo

```bash
https://forestry-rating.vercel.app
```

# Production Dependencies

```bash
Package	Version	Purpose
vue	3.5.29	Core framework
vue-router	5.0.3	Routing
pinia	3.0.4	State management
element-plus	2.13.3	UI components (green theme)
@fortawesome/fontawesome-free	7.2.0	Icons
chart.js	4.5.1	Charts
vue-chartjs	5.3.3	Vue wrapper for charts
@supabase/supabase-js	2.98.0	Database client

```

# Create backup

docker exec -t forestry-db pg*dump -U admin forestry_rating > backup*$(date +%Y%m%d).sql

# Restore from backup

docker exec -i forestry-db psql -U admin -d forestry_rating -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
cat backup.sql | docker exec -i forestry-db psql -U admin -d forestry_rating

# Direct PostgreSQL access

```bash
docker exec -it forestry-db psql -U admin -d forestry_rating
📁 Project Structure
text
forestry-rating/
├── backend/ # Express.js server
│ ├── server.js
│ └── package.json
├── frontend/ # Vue 3 application
│ ├── src/
│ │ ├── components/
│ │ ├── stores/
│ │ ├── lib/
│ │ └── App.vue
│ └── package.json
├── docker-compose.yml
└── README.md
🔒 Environment Variables
Create a .env file in the frontend directory:
```

Made with ❤️ for forest management 🌳
