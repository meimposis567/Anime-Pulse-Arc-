// server.js
import "dotenv/config";
import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import { LRUCache } from "lru-cache";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import { connectDB } from "./db.js";
import authRoutes from "./routes/auth.js";
import favoritesRoutes from "./routes/favorites.js";
import reviewsRoutes from "./routes/reviews.js";

const app = express();
const isProd = process.env.NODE_ENV === "production";
if (!isProd) app.use(morgan("tiny"));

app.set("etag", "strong");
app.disable("x-powered-by");
app.set("trust proxy", 1);

const PORT = process.env.PORT || 5001;
const ANILIST_URL = process.env.ANILIST_URL || "https://graphql.anilist.co";

/* ---------------------- Security & Core Middleware ---------------------- */
app.use(
  helmet({
    // Keep defaults; disable CSP in dev to avoid localhost hassles
    contentSecurityPolicy: isProd ? undefined : false,
  })
);

// Flexible CORS allow-list (includes CRA 3000, Vite 5173, and an env override)
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.FRONTEND_URL, // e.g., https://myapp.example.com
].filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      // allow same-origin/non-browser tools (like curl/postman) where origin is undefined
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      // also allow any localhost:* for convenience during dev
      const isLocalhost =
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);
      if (!isProd && isLocalhost) return cb(null, true);
      cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

// Global rate limiter (skips health & auth)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use((req, res, next) => {
  if (req.path.startsWith("/health") || req.path.startsWith("/api/auth"))
    return next();
  return limiter(req, res, next);
});

app.use(compression());
app.use(express.json({ limit: "1mb" }));

// Lightweight HTTP caching for idempotent GETs
app.use((req, res, next) => {
  if (req.method === "GET" && /^\/api\/(search|featured|anime|recommendations)/.test(req.path)) {
    res.setHeader(
      "Cache-Control",
      "public, max-age=60, stale-while-revalidate=120"
    );
  }
  next();
});

/* ------------------------- Utilities / Helpers -------------------------- */
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

// LRU cache for AniList responses
const cache = new LRUCache({ max: 500, ttl: 1000 * 60 * 5 });
const key = (prefix, payload) => `${prefix}:${JSON.stringify(payload || {})}`;

// AniList wrapper with retries + caching
async function anilist(query, variables = {}, { ttl = 1000 * 60 * 5, retries = 2 } = {}) {
  const k = key("anilist", { query, variables });
  const hit = cache.get(k);
  if (hit) return hit;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 20000); // 20s timeout
    try {
      const resp = await fetch(ANILIST_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ query, variables }),
        signal: controller.signal,
      });

      const data = await resp.json().catch(() => ({}));

      if (!resp.ok || data?.errors) {
        throw new Error(
          `AniList ${resp.status}: ${JSON.stringify(data?.errors || {})}`
        );
      }

      cache.set(k, data, { ttl });
      return data;
    } catch (err) {
      if (attempt === retries) throw err;
      if (!isProd) console.warn(`AniList retry ${attempt + 1}/${retries + 1}: ${err.message}`);
      await new Promise((r) => setTimeout(r, 400 * (attempt + 1))); // small backoff
    } finally {
      clearTimeout(t);
    }
  }
}

/* -------------------------------- Routes -------------------------------- */

// Health check
app.get("/health", (req, res) =>
  res.json({ ok: true, now: new Date().toISOString() })
);

// Featured anime
app.get(
  "/api/featured",
  asyncHandler(async (req, res) => {
    const query = `
      query($page:Int,$perPage:Int){
        Page(page:$page, perPage:$perPage){
          media(sort:[TRENDING_DESC,POPULARITY_DESC], type:ANIME, status_not:NOT_YET_RELEASED){
            id title{romaji english native} coverImage{large color}
            averageScore genres format season seasonYear
          }
        }
      }`;
    try {
      const data = await anilist(query, { page: 1, perPage: 36 });
      res.json(data?.data?.Page?.media ?? []);
    } catch (e) {
      // gentle fallback so UI doesn't hard-fail
      if (!isProd) console.error("Featured error:", e.message);
      res.json([]);
    }
  })
);

// Search anime
app.get(
  "/api/search",
  asyncHandler(async (req, res) => {
    const q = (req.query.q || "").trim();
    if (!q) return res.json([]);
    const query = `
      query($q:String,$page:Int,$perPage:Int){
        Page(page:$page, perPage:$perPage){
          media(search:$q, type:ANIME, sort:[SEARCH_MATCH,POPULARITY_DESC]){
            id title{romaji english native} coverImage{large color}
            averageScore genres format season seasonYear
          }
        }
      }`;
    try {
      const data = await anilist(query, { q, page: 1, perPage: 24 });
      res.json(data?.data?.Page?.media ?? []);
    } catch (e) {
      if (!isProd) console.error("Search error:", e.message);
      res.json([]);
    }
  })
);

// Anime details
app.get(
  "/api/anime/:id",
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid anime id" });

    const query = `
      query($id:Int){
        Media(id:$id, type:ANIME){
          id
          title{romaji english native}
          coverImage{extraLarge large color}
          bannerImage
          description(asHtml:false)
          averageScore episodes duration status format season seasonYear genres
          studios(isMain:true){ nodes{ id name } }
          externalLinks{ id site url language }
          relations{
            edges{
              relationType(version:2)
              node{ id title{romaji english native} coverImage{large} format type }
            }
          }
          characters(perPage:12, sort:ROLE){
            edges{
              role
              node{ id name{full native} image{large} }
              voiceActors(language:JAPANESE){ id name{full} image{large} }
            }
          }
          streamingEpisodes{ title thumbnail url site }
        }
      }`;
    try {
      const data = await anilist(query, { id });
      const media = data?.data?.Media;
      if (!media) return res.status(404).json({ error: "Anime not found" });
      res.json(media);
    } catch (e) {
      if (!isProd) console.error("Anime details error:", e.message);
      // Return a soft error so UI can show a friendly message
      res.status(502).json({ error: "Upstream service unavailable. Try again later." });
    }
  })
);

// Recommendations / filtering
app.get(
  "/api/recommendations",
  asyncHandler(async (req, res) => {
    const {
      genres,
      format,
      status,
      season,
      year,
      minScore,
      maxScore,
      sort,
      platform,
    } = req.query;

    const vars = {
      page: 1,
      perPage: 36,
      ...(genres
        ? { genres: String(genres).split(",").map((s) => s.trim()).filter(Boolean) }
        : {}),
      ...(format ? { format } : {}),
      ...(status ? { status } : {}),
      ...(season ? { season } : {}),
      ...(year ? { seasonYear: Number(year) } : {}),
      ...(minScore ? { minScore: Number(minScore) } : {}),
      ...(maxScore ? { maxScore: Number(maxScore) } : {}),
      sort: sort ? String(sort).split(",") : ["POPULARITY_DESC"],
    };

    const query = `
      query($page:Int,$perPage:Int,$genres:[String],$format:MediaFormat,$status:MediaStatus,
            $season:MediaSeason,$seasonYear:Int,$minScore:Int,$maxScore:Int,$sort:[MediaSort]){
        Page(page:$page, perPage:$perPage){
          media(
            type:ANIME
            genre_in:$genres
            format:$format
            status:$status
            season:$season
            seasonYear:$seasonYear
            averageScore_greater:$minScore
            averageScore_lesser:$maxScore
            sort:$sort
          ){
            id title{romaji english native} coverImage{large color}
            averageScore genres format season seasonYear
            externalLinks{ site url }
          }
        }
      }`;

    try {
      const data = await anilist(query, vars);
      let items = data?.data?.Page?.media ?? [];

      // Optional platform filter (normalize names)
      if (platform) {
        const needle = String(platform).toLowerCase().trim();

        const synonyms = {
          netflix: ["netflix"],
          prime: ["prime", "amazon", "amazon prime", "amazon prime video"],
          hidive: ["hidive", "hi dive"],
          crunchyroll: ["crunchyroll", "cr"],
          hulu: ["hulu"],
        };

        const flatIncludes = (name, keys) =>
          keys.some((s) => name.includes(s));

        items = items.filter((m) =>
          (m.externalLinks || []).some((l) => {
            const site = (l?.site || "").toLowerCase();
            // match direct includes or mapped synonyms
            if (site.includes(needle)) return true;
            const syn = synonyms[needle];
            return syn ? flatIncludes(site, syn) : false;
          })
        );
      }

      res.json(items);
    } catch (e) {
      if (!isProd) console.error("Recommendations error:", e.message);
      res.json([]); // safe fallback for UI
    }
  })
);

/* ------------------------- Mount DB-backed Routes ------------------------ */
// Mount routes regardless; they may 500 if DB truly unavailable,
// but at least the API surface exists so the frontend doesn’t “blank”.
app.use("/api/auth", authRoutes);
app.use("/api/favorites", favoritesRoutes);
app.use("/api/reviews", reviewsRoutes);

// Simple status endpoint to help UI decide what to show
app.get("/api/status", (req, res) => {
  res.json({
    api: "ok",
    env: process.env.NODE_ENV || "development",
  });
});

/* ------------------------------ Error Handler --------------------------- */
app.use((err, req, res, next) => {
  // Centralized logging
  console.error("Server error:", err);
  const message = isProd
    ? "Something went wrong."
    : err?.message || "Internal Server Error";
  res.status(500).json({ error: message });
});

/* --------------------- Connect Mongo & Start the Server ------------------ */
(async () => {
  try {
    await connectDB(process.env.MONGODB_URI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("⚠️ Mongo connection failed:", err.message);
    // Continue running so non-DB routes (featured/search/anilist) still work
  }

  app.listen(PORT, () => {
    console.log(`✅ API running on http://localhost:${PORT}`);
  });
})();
