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

🌐 Production Deployment
The project is deployed using modern cloud services:

Frontend: Vercel - Automatic deploys from GitHub

Database & Auth: Supabase - PostgreSQL with built-in authentication

Live Demo
text
https://forestry-rating.vercel.app
Test Credentials
Role	Email	Password
👑 Administrator	admin@skidles.by	admin123
👷 Engineer	engineer@skidles.by	pass123
📊 Database Management
Backup & Restore
bash
# Create backup
docker exec -t forestry-db pg_dump -U admin forestry_rating > backup_$(date +%Y%m%d).sql

# Restore from backup
docker exec -i forestry-db psql -U admin -d forestry_rating -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
cat backup.sql | docker exec -i forestry-db psql -U admin -d forestry_rating

# Direct PostgreSQL access
docker exec -it forestry-db psql -U admin -d forestry_rating
📁 Project Structure
text
forestry-rating/
├── backend/           # Express.js server
│   ├── server.js
│   └── package.json
├── frontend/          # Vue 3 application
│   ├── src/
│   │   ├── components/
│   │   ├── stores/
│   │   ├── lib/
│   │   └── App.vue
│   └── package.json
├── docker-compose.yml
└── README.md
🔒 Environment Variables
Create a .env file in the frontend directory:

env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
🎯 Key Implementation Features
Real-time Updates - Instant data synchronization

Role-based Access - Granular permissions system

Responsive Design - Mobile-friendly interface

Optimized Performance - Caching and lazy loading

Comprehensive Statistics - Quarterly and trend analysis

📈 Statistics Module
Quarterly Comparison - Bar charts comparing forestries

Trend Analysis - Line charts showing monthly dynamics

Leaderboards - Top and bottom performers

Detailed Tables - Monthly breakdown of all indicators

👨‍💻 Development
Tech Stack Details
State Management: Pinia

Styling: Scoped CSS

Charts: Chart.js with vue-chartjs

API Client: Supabase JavaScript client

Build Tool: Vite

Contributing
Fork the repository

Create your feature branch (git checkout -b feature/AmazingFeature)

Commit changes (git commit -m 'Add AmazingFeature')

Push to branch (git push origin feature/AmazingFeature)

Open a Pull Request

📝 License
This project is created for educational purposes. Free to use and modify.

🤝 Support
For issues and questions, please open an issue on GitHub or contact the development team.

Made with ❤️ for forest management 🌳
```
