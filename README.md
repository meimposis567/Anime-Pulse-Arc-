<div align="center">

# Anime Pulse ARC

**A modern, full-stack anime discovery portal — search, filter, and explore thousands of anime titles with a fast API layer and a neon "otaku" interface.**

[![Stack](https://img.shields.io/badge/stack-MERN-00d8ff)](#-technology-stack)
[![Node](https://img.shields.io/badge/node-%3E%3D18-3c873a)](https://nodejs.org)
[![React](https://img.shields.io/badge/react-18-61dafb)](https://react.dev)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

</div>

---

## Table of Contents

- [Overview](#-overview)
- [Problem Statement](#-problem-statement)
- [Key Features](#-key-features)
- [How the System Works](#️-how-the-system-works)
- [Technology Stack](#-technology-stack)
- [Installation & Setup](#-installation--setup)
- [Usage](#-usage)
- [API Reference](#-api-reference)
- [Project Structure](#-project-structure)
- [Security & Configuration](#-security--configuration)
- [Future Enhancements](#-future-enhancements)
- [Team & Credits](#-team--credits)
- [License](#-license)

---

## 🎬 Overview

**Anime Pulse ARC** is a full-stack MERN web application for discovering anime. It sits on top of the
public [AniList GraphQL API](https://anilist.co) and adds the things a raw public API does not give you:
a cached and rate-limited server layer, multi-dimensional filtering (including *streaming platform*),
user accounts, personal favourites, and community reviews — all wrapped in a responsive, animated
interface built for people who actually watch anime.

The goal is simple: **go from "I want something new to watch" to "I found it" in a handful of clicks.**

---

## ❓ Problem Statement

Anime fans face a discovery problem that ordinary catalogue sites do not solve well:

| Pain point | What actually happens |
| --- | --- |
| **Fragmented catalogues** | Titles are scattered across Crunchyroll, Netflix, Prime Video, HiDive and Hulu, with no single view of what is available where. |
| **Weak filtering** | Most sites let you browse by genre, but not by *genre + format + season + score + platform* at the same time. |
| **Slow, rate-limited public APIs** | Querying AniList directly from the browser is slow, leaks request volume, and hits rate limits quickly. |
| **No personal layer** | Users cannot keep a favourites list or leave reviews without signing up for yet another service. |
| **Confusing watch order** | Long-running franchises with seasons, movies, OVAs and spin-offs are hard to navigate in the right order. |

**Anime Pulse ARC** addresses all five: one unified, cached, filterable portal with accounts,
favourites, reviews, and a per-title guide that lays out relations and where to stream.

---

## ✨ Key Features

### Discovery

- 🔍 **Instant search** — debounced title search with results rendered directly beneath the search bar.
- 🔥 **Featured grid** — up to 36 trending / most-popular titles, refreshed live from AniList.
- 🎛️ **Advanced recommendation filters** — combine genre, format, airing status, season, year and score range.
- 📺 **Streaming platform filter** — narrow results to Crunchyroll, Netflix, Prime Video, HiDive or Hulu, with synonym matching (e.g. `amazon` → *Amazon Prime Video*).
- 📖 **Anime Guide page** — synopsis, studios, episode count, characters with Japanese voice actors, related entries, clickable watch-order cards, and external streaming links.

### Accounts & Community

- 🔐 **JWT authentication** — register and log in with bcrypt-hashed passwords and 7-day signed tokens.
- ⭐ **Favourites** — save titles to a personal list backed by MongoDB.
- 📝 **Reviews & ratings** — post, read and delete reviews per anime.

### Engineering

- ⚡ **LRU response cache** — 500-entry, 5-minute TTL cache in front of AniList; repeat queries never leave the server.
- 🔁 **Retry with backoff** — up to three attempts with a 20-second abort timeout per upstream call.
- 🛡️ **Hardened API** — Helmet, an origin allow-list for CORS, a 300-request/15-minute rate limiter, gzip compression, and a 1 MB JSON body cap.
- 🩹 **Graceful degradation** — if MongoDB or AniList is unavailable, the server still boots and discovery routes still answer instead of blanking the UI.
- 🎨 **"Otaku Ultra" theme** — animated cosmic gradient, glassmorphic neon cards, 3D hover tilt, and full `prefers-reduced-motion` support.
- 🐳 **One-command Docker setup** — frontend, backend and MongoDB via `docker compose`.

---

## ⚙️ How the System Works

```
┌─────────────────────────────────────────────────────────────────────┐
│                       Browser (React + Vite)                        │
│   Home · Recommendation · Anime Guide  —  Tailwind + Otaku theme    │
└──────────────────────────────┬──────────────────────────────────────┘
                               │  REST over HTTP(S)   (VITE_API_BASE)
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     Express API  (backend, :5001)                   │
│                                                                     │
│    Helmet · CORS allow-list · rate limit · compression · morgan     │
│                               │                                     │
│        ┌──────────────────────┴──────────────────────┐              │
│        ▼                                             ▼              │
│  ┌───────────────┐                         ┌───────────────────┐    │
│  │   LRU Cache   │  hit → return instantly │  Auth middleware  │    │
│  │  500 / 5 min  │                         │   (JWT verify)    │    │
│  └───────┬───────┘                         └─────────┬─────────┘    │
│          │ miss                                      │              │
└──────────┼──────────────────────────────────────────┼──────────────┘
           ▼                                           ▼
┌────────────────────────────┐            ┌────────────────────────────┐
│   AniList GraphQL API      │            │   MongoDB (Mongoose)       │
│   retry ×3 · 20 s timeout  │            │   User · Favorite · Review │
└────────────────────────────┘            └────────────────────────────┘
```

**Request lifecycle**

1. **User action** — a search, a filter change, or opening a title in the React app.
2. **Frontend call** — the app calls its own backend at `VITE_API_BASE`; AniList is never contacted from the browser.
3. **Cache lookup** — the server builds a deterministic key from `(query, variables)` and checks the LRU cache. On a hit it responds immediately.
4. **Upstream fetch** — on a miss, the server issues a GraphQL query to AniList with retry and backoff, then caches the result for five minutes.
5. **Post-processing** — platform filtering is applied server-side over each title's `externalLinks`, so the browser only receives what the user asked for.
6. **Personal data** — favourites and reviews are read from and written to MongoDB, gated by the JWT `Authorization: Bearer <token>` header.
7. **Response** — JSON is compressed, tagged with a strong ETag and `Cache-Control`, and rendered into the UI.

---

## 🧰 Technology Stack

### Frontend

| Technology | Purpose |
| --- | --- |
| **React 18** | Component UI with `React.lazy` route-level code splitting |
| **Vite 5** | Dev server and production bundler |
| **React Router 6** | Client-side routing (`/`, `/recommendation`, `/anime/:id`) |
| **Tailwind CSS 3** | Utility-first styling |
| **Framer Motion** | Page and card animations |
| **Lucide React** | Icon set |
| **clsx** | Conditional class composition |

### Backend

| Technology | Purpose |
| --- | --- |
| **Node.js (ESM)** | Runtime |
| **Express 4** | HTTP API framework |
| **Mongoose 8** | MongoDB ODM and schema modelling |
| **jsonwebtoken** | JWT issuing and verification |
| **bcryptjs** | Password hashing |
| **lru-cache** | In-memory upstream response cache |
| **helmet**, **cors**, **express-rate-limit** | Security middleware |
| **compression**, **morgan** | Response compression and dev logging |
| **node-fetch** | AniList GraphQL client |
| **dotenv** | Environment configuration |

### Data & Infrastructure

| Technology | Purpose |
| --- | --- |
| **MongoDB 6** | Users, favourites and reviews |
| **AniList GraphQL API** | Anime catalogue, artwork, characters and streaming links |
| **Docker & Docker Compose** | Reproducible multi-service local environment |

---

## 🚀 Installation & Setup

### Prerequisites

- **Node.js** ≥ 18 and **npm** ≥ 9
- **MongoDB** 6+ — a local instance or a MongoDB Atlas cluster
- **Docker Desktop** *(optional — only for the container route)*
- **Git**

### Option A — Docker (fastest)

```bash
git clone https://github.com/meimposis567/Anime-Pulse-Arc-.git
cd Anime-Pulse-Arc-

docker compose up --build
```

| Service | URL |
| --- | --- |
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5001 |
| MongoDB | mongodb://localhost:27017 |

### Option B — Local development

**1. Clone the repository**

```bash
git clone https://github.com/meimposis567/Anime-Pulse-Arc-.git
cd Anime-Pulse-Arc-
```

**2. Start the backend**

```bash
cd backend
cp .env.example .env          # PowerShell:  Copy-Item .env.example .env
# open .env and set MONGODB_URI and JWT_SECRET
npm install
npm run dev                   # → http://localhost:5001
```

**3. Start the frontend** *(in a second terminal)*

```bash
cd frontend
cp .env.example .env          # PowerShell:  Copy-Item .env.example .env
npm install
npm run dev                   # → http://localhost:5173
```

**4. Verify**

```bash
curl http://localhost:5001/health
# {"ok":true,"now":"..."}
```

### Environment variables

**`backend/.env`**

| Variable | Required | Default | Description |
| --- | :---: | --- | --- |
| `PORT` | no | `5001` | Port the API listens on |
| `NODE_ENV` | no | `development` | Enables production hardening when set to `production` |
| `ANILIST_URL` | no | `https://graphql.anilist.co` | Upstream GraphQL endpoint |
| `MONGODB_URI` | **yes** | — | MongoDB connection string |
| `JWT_SECRET` | **yes** | — | Secret used to sign JWTs (`openssl rand -hex 32`) |
| `FRONTEND_URL` | no | — | Extra origin added to the CORS allow-list in production |

**`frontend/.env`**

| Variable | Required | Default | Description |
| --- | :---: | --- | --- |
| `VITE_API_BASE` | no | `http://localhost:5001` | Base URL of the backend API |

> ⚠️ **Never commit a real `.env` file.** Both are ignored by [`.gitignore`](.gitignore); commit only the `.env.example` templates.

### Production build

```bash
# Frontend → static assets in frontend/dist
cd frontend && npm run build && npm run preview

# Backend
cd backend && npm start
```

---

## 📖 Usage

### Home

1. Open http://localhost:5173.
2. Type a title into the search bar — results appear immediately below it, above the Featured grid.
3. Scroll to **Featured** for the current trending and most-popular titles.
4. Click any card to open its **Anime Guide**.

### Recommendation

1. Go to **Recommendation** in the navbar.
2. Combine the filters you care about:
   - **Genre** — Action, Romance, Isekai, Slice of Life, …
   - **Format** — TV, Movie, OVA, ONA, Special
   - **Status** — Releasing, Finished, Not Yet Released
   - **Season / Year** — Winter, Spring, Summer, Fall
   - **Score range** — minimum and maximum average score
   - **Platform** — Crunchyroll, Netflix, Prime Video, HiDive, Hulu
3. Results are filtered **server-side** and returned as a card grid.

### Anime Guide

Opening a title (`/anime/:id`) shows the synopsis, score, episode count, studios, genres,
main characters with their Japanese voice actors, related entries as **clickable watch-order cards**,
and direct links to legal streaming platforms.

### Accounts, favourites and reviews

```bash
# Register
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"otaku","email":"otaku@example.com","password":"a-strong-password"}'

# Log in → returns { token }
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"otaku@example.com","password":"a-strong-password"}'

# Use the token on protected routes
curl http://localhost:5001/api/favorites -H "Authorization: Bearer <TOKEN>"
```

---

## 🔌 API Reference

### Public — discovery

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/health` | Liveness probe |
| `GET` | `/api/status` | API status and environment |
| `GET` | `/api/featured` | Up to 36 trending / popular titles |
| `GET` | `/api/search?q=<query>` | Title search (24 results) |
| `GET` | `/api/anime/:id` | Full detail: characters, relations, streaming links |
| `GET` | `/api/recommendations` | Filtered results — `genres`, `format`, `status`, `season`, `year`, `minScore`, `maxScore`, `sort`, `platform` |

### Protected — requires `Authorization: Bearer <token>`

| Method | Endpoint | Body | Description |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | `{ username, email, password }` | Create an account |
| `POST` | `/api/auth/login` | `{ email, password }` | Obtain a JWT |
| `GET` | `/api/favorites` | — | List the signed-in user's favourites |
| `POST` | `/api/favorites` | `{ animeId, title, coverImage }` | Add a favourite |
| `DELETE` | `/api/favorites/:animeId` | — | Remove a favourite |
| `GET` | `/api/reviews/:animeId` | — | List reviews for a title |
| `POST` | `/api/reviews/:animeId` | `{ rating, content }` | Post a review |
| `DELETE` | `/api/reviews/:animeId` | — | Delete your own review |

Full request/response details: [`docs/API.md`](docs/API.md).

---

## 📁 Project Structure

```
Anime-Pulse-Arc-/
├── backend/                        # Express API server
│   ├── src/
│   │   ├── index.js                # Entry: middleware, AniList proxy, cache, routes
│   │   ├── db.js                   # MongoDB connection helper
│   │   ├── middleware/
│   │   │   └── auth.js             # JWT verification middleware
│   │   ├── models/
│   │   │   ├── User.js             # Account + bcrypt password helpers
│   │   │   ├── Favorite.js         # Saved titles per user
│   │   │   └── Review.js           # Ratings and written reviews
│   │   └── routes/
│   │       ├── auth.js             # /api/auth       — register, login
│   │       ├── favorites.js        # /api/favorites
│   │       └── reviews.js          # /api/reviews
│   ├── .env.example                # Backend config template (safe to commit)
│   ├── Dockerfile
│   └── package.json
│
├── frontend/                       # React + Vite client
│   ├── src/
│   │   ├── main.jsx                # React root, global styles
│   │   ├── App.jsx                 # Navbar, routes, API context
│   │   ├── auth.js                 # Token storage helper
│   │   ├── pages/
│   │   │   ├── Home.jsx            # Search + Featured grid
│   │   │   ├── Recommendation.jsx  # Filter-driven discovery
│   │   │   └── AnimeGuide.jsx      # Title detail + watch order
│   │   ├── components/
│   │   │   ├── SearchBar.jsx
│   │   │   ├── FeaturedGrid.jsx
│   │   │   ├── AnimeCard.jsx
│   │   │   ├── RecommendationFilters.jsx
│   │   │   └── SkeletonCard.jsx
│   │   ├── assets/logo.png
│   │   ├── index.css               # Tailwind layers
│   │   └── otaku-theme.css         # Neon / glassmorphic theme tokens
│   ├── .env.example                # Frontend config template (safe to commit)
│   ├── tailwind.config.cjs
│   ├── vite.config.js
│   ├── Dockerfile
│   └── package.json
│
├── docs/
│   ├── API.md                      # Endpoint reference
│   └── UI_THEME.md                 # Otaku Ultra theme notes
│
├── docker-compose.yml              # frontend + backend + mongo
├── .gitignore
├── LICENSE
└── README.md
```

---

## 🔒 Security & Configuration

- **No secrets in the repository.** `.env` files, keys, certificates and credential files are excluded by [`.gitignore`](.gitignore); only `.env.example` templates are tracked.
- **Passwords are never stored in plain text** — bcrypt hashing with a per-user salt.
- **JWTs expire after seven days** and are verified on every protected route.
- **Rate limiting** — 300 requests per 15 minutes per IP on discovery routes.
- **Helmet** sets secure HTTP headers; `x-powered-by` is disabled.
- **CORS** uses an explicit origin allow-list; add your deployed domain via `FRONTEND_URL`.
- **Request size cap** — JSON bodies are limited to 1 MB.

> If a real connection string or secret was ever exposed, **rotate it immediately** — removing it from a
> file is not enough once it has been shared.

---

## 🌱 Future Enhancements

- [ ] **Watchlist & progress tracking** — mark titles as watching / completed / dropped, with per-episode progress.
- [ ] **Personalised recommendation engine** — content-based and collaborative filtering over favourites and ratings.
- [ ] **Seasonal calendar** — an airing schedule with episode countdowns and reminders.
- [ ] **Manga support** — extend the AniList proxy to `MediaType.MANGA`.
- [ ] **Social layer** — follow other users, share lists, and comment on reviews.
- [ ] **Region-aware availability** — resolve streaming platforms per country.
- [ ] **Progressive Web App** — installable, with offline caching of browsed titles.
- [ ] **Theme toggle** — a light mode persisted per user alongside the Otaku Ultra theme.
- [ ] **Redis cache layer** — replace the in-process LRU cache for horizontal scaling.
- [ ] **Automated testing & CI** — Jest + Supertest for the API, Vitest + Testing Library for the UI, run on GitHub Actions.
- [ ] **Accessibility audit** — full keyboard navigation and screen-reader labelling.
- [ ] **Internationalisation** — English, Japanese and Tamil interface strings.

---

## 👥 Team & Credits

**Anime Pulse ARC** was designed and built by:

| Name | GitHub |
| --- | --- |
| **Akash S.M** | [@meimposis567](https://github.com/meimposis567) |
| **Akash S** | [@akash02062005](https://github.com/akash02062005) |
| **Chandru P** | [@MrChandru345](https://github.com/MrChandru345) |
| **Aaron Marshall A** | [@AaronMarshall2005](https://github.com/AaronMarshall2005) |

© 2025 Akash S.M, Akash S, Chandru P and Aaron Marshall A — **all rights reserved**, except as granted by the [MIT License](LICENSE).

### Acknowledgements

- **[AniList](https://anilist.co)** — for the open GraphQL API that powers the anime catalogue.
- **[Tailwind CSS](https://tailwindcss.com)**, **[Vite](https://vitejs.dev)**, **[Framer Motion](https://www.framer.com/motion/)** and **[Lucide](https://lucide.dev)** — for the open-source tooling behind the interface.
- All anime titles, artwork and metadata remain the property of their respective creators, studios and licensors. Anime Pulse ARC is an unofficial, non-commercial discovery tool and is not affiliated with AniList or any streaming platform.

---

## 📄 License

Released under the **MIT License** — see [LICENSE](LICENSE) for the full text.

<div align="center">

**Made with 💙 by the Anime Pulse ARC team**

</div>
