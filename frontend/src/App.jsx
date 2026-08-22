 import React, { Suspense } from "react";
import { Routes, Route, NavLink } from "react-router-dom";
const Home = React.lazy(() => import("./pages/Home.jsx"));
const Recommendation = React.lazy(() => import("./pages/Recommendation.jsx"));
const AnimeGuide = React.lazy(() => import("./pages/AnimeGuide.jsx"));

// ✅ import your logo correctly (place it in src/assets/og-ani.png)
import logo from "./assets/logo.png";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5001";
export const ApiContext = React.createContext(API_BASE);

function Navbar() {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur bg-slate-950/60 border-b border-slate-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* Logo + Title */}
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="Anime Pulse Arc Logo"
            className="w-12 h-12 object-contain drop-shadow-[0_0_15px_rgba(0,255,255,0.8)] animate-pulse"
          />
          <span className="text-xl font-extrabold tracking-wide bg-gradient-to-r from-cyan-400 via-blue-500 to-pink-500 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(0,255,255,0.7)]">
            Anime Pulse Arc
          </span>
        </div>

        {/* Links */}
        <div className="flex gap-6">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `transition-all duration-300 ${
                isActive
                  ? "text-cyan-400 drop-shadow-[0_0_10px_rgba(0,255,255,0.9)] font-semibold"
                  : "text-slate-300 hover:text-cyan-300"
              }`
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/recommendation"
            className={({ isActive }) =>
              `transition-all duration-300 ${
                isActive
                  ? "text-pink-400 drop-shadow-[0_0_10px_rgba(255,0,128,0.9)] font-semibold"
                  : "text-slate-300 hover:text-pink-300"
              }`
            }
          >
            Recommendation
          </NavLink>
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <ApiContext.Provider value={API_BASE}>
      <Navbar />
      <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-10 text-slate-400">Loading…</div>}>
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/recommendation" element={<Recommendation />} />
        <Route path="/anime/:id" element={<AnimeGuide />} />
      </Routes>
      </Suspense>
    </ApiContext.Provider>
  );
}
