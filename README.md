# Kiosk Ordering System (POC) — React + Node + PostgreSQL

This repo contains a **ready-to-run POC skeleton** for:
- **Kiosk UI** (touch-first, 4K portrait friendly)
- **Admin UI** (login + kiosk control + CRUD + orders + receipt print)
- **API** (Node/Express + Socket.IO)
- **DB** (PostgreSQL)

## Prerequisites
- Node.js 18+
- Docker (for Postgres)

## 1) Start Database
```bash
docker compose up -d
```

## 2) Install dependencies
```bash
npm install
```

## 3) Configure API environment
```bash
cp services/api/.env.example services/api/.env
```

## 4) Create DB tables + seed
```bash
cd services/api
npx prisma migrate dev --name init
node prisma/seed.js
cd ../..
```

## 5) Run everything
```bash
npm run dev
```

This command starts all three services simultaneously:
- **API Server** (Node.js + Express) on port 4000
- **Kiosk UI** (React + Vite) on port 5173  
- **Admin UI** (React + Vite) on port 5174 (or next available)

Access URLs:
- Kiosk UI: http://localhost:5173
- Admin UI: http://localhost:5174 (or next available port)
- API: http://localhost:4000/health

### Admin credentials (seed)
- Username: **admin**
- Password: **admin123** (change in `services/api/.env`)

## Notes
- Kiosk shows **logo-only welcome**, then a **mode + user/group + balance** screen, then ordering.
- Success screen shows **remaining balance** and **auto resets** to welcome.
- Admin receives orders and can **print receipt**.
