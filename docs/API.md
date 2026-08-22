# Anime Portal – MERN Edition (Exact UI preserved)

This package upgrades your original project to a full MERN stack **without changing the frontend look**.

## What changed
- Added **MongoDB** (+ Docker service) and **Mongoose models**: User, Favorite, Review
- Added **JWT auth** routes: `/api/auth/register`, `/api/auth/login`
- Added **Favorites** routes: `/api/favorites` (GET, POST, DELETE)
- Added **Reviews** routes: `/api/reviews/:animeId` (GET, POST, DELETE)
- Backend still proxies AniList for data. Frontend remains visually identical.

## Quick Start (Docker)
```bash
docker compose up --build
```
- Frontend: http://localhost:5173
- Backend API: http://localhost:5001
- MongoDB: mongodb://localhost:27017/anime_portal

## Local Dev
```bash
# Backend
cd backend
cp .env.sample .env
npm install
npm run dev

# Frontend
cd ../frontend
cp .env.sample .env   # ensure VITE_API_BASE=http://localhost:5001
npm install
npm run dev
```

## Auth & Features
- Register: `POST /api/auth/register` { username, email, password }
- Login: `POST /api/auth/login` { email, password } → returns `{ token }`
- Use token in `Authorization: Bearer <token>`
- Favorites:
  - `GET /api/favorites`
  - `POST /api/favorites` { animeId, title, coverImage }
  - `DELETE /api/favorites/:animeId`
- Reviews:
  - `GET /api/reviews/:animeId`
  - `POST /api/reviews/:animeId` { rating, content }
  - `DELETE /api/reviews/:animeId`

> Frontend UI was not modified. You can wire buttons to these endpoints later without changing layout.