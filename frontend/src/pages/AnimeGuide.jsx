import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, Star, Clock, Layers, CalendarDays, Building2,
  ExternalLink, PlayCircle, Users, GitBranch, AlertCircle,
} from 'lucide-react'
import { ApiContext } from '../App.jsx'

const RELATION_ORDER = ['PREQUEL', 'SEQUEL', 'SIDE_STORY', 'ALTERNATIVE']

const STATUS_TONE = {
  RELEASING: 'text-emerald-300 border-emerald-400/40 bg-emerald-400/10',
  FINISHED: 'text-cyan-300 border-cyan-400/40 bg-cyan-400/10',
  NOT_YET_RELEASED: 'text-amber-300 border-amber-400/40 bg-amber-400/10',
  CANCELLED: 'text-rose-300 border-rose-400/40 bg-rose-400/10',
  HIATUS: 'text-violet-300 border-violet-400/40 bg-violet-400/10',
}

function Stat({ icon: Icon, label, value }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2.5">
      <Icon size={14} className="mt-0.5 shrink-0 text-cyan-400/80" />
      <div className="min-w-0">
        <div className="text-[9px] font-semibold tracking-[0.2em] text-slate-500">{label}</div>
        <div className="truncate text-[13px] text-slate-200">{value}</div>
      </div>
    </div>
  )
}

function SectionTitle({ jp, children, icon: Icon }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2.5">
        {Icon && <Icon size={15} className="text-pink-400/80" />}
        <span className="font-display text-[10px] font-semibold tracking-[0.35em] text-pink-400/70">{jp}</span>
      </div>
      <h2 className="arc-title mt-1 font-display text-xl font-bold tracking-wide">{children}</h2>
      <div className="arc-rule mt-2.5" />
    </div>
  )
}

function GuideSkeleton() {
  return (
    <div>
      <div className="arc-skeleton h-56 w-full md:h-80" />
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 md:grid-cols-[260px_1fr]">
        <div className="arc-skeleton aspect-[3/4] rounded-2xl" />
        <div className="space-y-4">
          <div className="arc-skeleton h-9 w-2/3 rounded" />
          <div className="arc-skeleton h-4 w-1/3 rounded" />
          <div className="arc-skeleton h-28 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export default function AnimeGuide() {
  const { id } = useParams()
  const navigate = useNavigate()
  const API_BASE = useContext(ApiContext)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancel = false
    setLoading(true)
    setData(null)
    window.scrollTo({ top: 0, behavior: 'auto' })
    fetch(`${API_BASE}/api/anime/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (!cancel) { setData(d && !d.error ? d : null); setLoading(false) } })
      .catch(() => { if (!cancel) setLoading(false) })
    return () => { cancel = true }
  }, [id, API_BASE])

  if (loading) return <GuideSkeleton />

  if (!data) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <AlertCircle size={30} className="mx-auto mb-4 text-pink-400/70" />
        <h1 className="arc-title font-display text-2xl font-bold">Title not found</h1>
        <p className="mt-2 text-sm text-slate-500">
          It may have been removed upstream, or the link is wrong.
        </p>
        <Link to="/" className="arc-btn mt-6 font-display text-sm">
          <ArrowLeft size={14} /> Back home
        </Link>
      </div>
    )
  }

  const title = data.title?.english || data.title?.romaji
  const synopsis = data.description?.replace(/<[^>]+>/g, '').trim()
  const watchEdges = (data.relations?.edges || [])
    .filter((e) => RELATION_ORDER.includes(e.relationType))
    .sort((a, b) => RELATION_ORDER.indexOf(a.relationType) - RELATION_ORDER.indexOf(b.relationType))
  const links = (data.externalLinks || []).filter((l) => l.url).slice(0, 8)

  return (
    <article className="pb-8">
      {/* ─────────── Banner ─────────── */}
      <div className="relative h-56 w-full overflow-hidden md:h-80">
        {data.bannerImage ? (
          <img src={data.bannerImage} alt="" className="h-full w-full scale-105 object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-violet-900/50 via-slate-900 to-cyan-900/40" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#04030c] via-[#04030c]/55 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#04030c]/85 to-transparent" />

        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/45 px-3 py-1.5 text-xs font-semibold text-slate-200 backdrop-blur-md transition-all hover:-translate-x-0.5 hover:border-cyan-300/60 hover:text-cyan-200"
        >
          <ArrowLeft size={13} /> Back
        </button>
      </div>

      <div className="mx-auto max-w-7xl px-4">
        <div className="grid gap-8 md:grid-cols-[260px_1fr]">
          {/* ─────────── Left column ─────────── */}
          <div className="-mt-24 md:-mt-32">
            <div className="arc-card arc-ring overflow-hidden">
              <img
                src={data.coverImage?.extraLarge || data.coverImage?.large}
                alt={title}
                className="w-full object-cover"
              />
            </div>

            {data.averageScore ? (
              <div className="mt-4 flex items-center justify-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] py-3">
                <div
                  className="arc-score !h-14 !w-14 text-base font-bold"
                  style={{ '--pct': data.averageScore, '--ring-color': 'var(--cyber)' }}
                >
                  <span>{data.averageScore}</span>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-amber-300">
                    <Star size={13} fill="currentColor" />
                    <span className="font-display text-lg font-bold">
                      {(data.averageScore / 10).toFixed(1)}
                    </span>
                  </div>
                  <div className="text-[10px] tracking-widest text-slate-500">AVG SCORE</div>
                </div>
              </div>
            ) : null}

            <div className="mt-4 space-y-2">
              <Stat icon={Layers} label="FORMAT" value={data.format?.replace('_', ' ')} />
              <Stat icon={PlayCircle} label="EPISODES" value={data.episodes} />
              <Stat icon={Clock} label="DURATION" value={data.duration ? `${data.duration} min` : null} />
              <Stat
                icon={CalendarDays}
                label="SEASON"
                value={data.seasonYear ? `${data.season || ''} ${data.seasonYear}`.trim() : null}
              />
              <Stat icon={Building2} label="STUDIO" value={data.studios?.nodes?.map((s) => s.name).join(', ')} />
            </div>
          </div>

          {/* ─────────── Right column ─────────── */}
          <div className="space-y-12 pt-6 md:pt-8">
            {/* Heading */}
            <header>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {data.status && (
                  <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-widest ${STATUS_TONE[data.status] || 'border-white/15 bg-white/5 text-slate-300'}`}>
                    {data.status.replace(/_/g, ' ')}
                  </span>
                )}
                {(data.genres || []).slice(0, 5).map((g) => (
                  <span key={g} className="arc-pill">{g}</span>
                ))}
              </div>

              <h1 className="arc-title font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                {title}
              </h1>
              {data.title?.native && (
                <div className="mt-1.5 text-sm tracking-wide text-slate-500">{data.title.native}</div>
              )}

              {synopsis && (
                <p className="mt-5 max-w-3xl text-[15px] leading-relaxed text-slate-300">{synopsis}</p>
              )}
            </header>

            {/* Where to watch */}
            {links.length > 0 && (
              <section>
                <SectionTitle jp="配信" icon={ExternalLink}>Where to Watch</SectionTitle>
                <div className="flex flex-wrap gap-2.5">
                  {links.map((l) => (
                    <a
                      key={l.id ?? l.url}
                      href={l.url}
                      target="_blank"
                      rel="noreferrer"
                      className="arc-btn !py-2 font-display text-xs"
                    >
                      {l.site}
                      <ExternalLink size={12} className="opacity-70" />
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Episodes */}
            {(data.streamingEpisodes || []).length > 0 && (
              <section className="section">
                <SectionTitle jp="エピソード" icon={PlayCircle}>Episodes</SectionTitle>
                <div className="grid gap-3 sm:grid-cols-2">
                  {data.streamingEpisodes.slice(0, 12).map((ep) => (
                    <a
                      key={ep.url}
                      href={ep.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex gap-3 overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.025] p-2.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/45 hover:bg-white/[0.05]"
                    >
                      <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-lg">
                        <img
                          src={ep.thumbnail}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <span className="absolute inset-0 grid place-items-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                          <PlayCircle size={20} className="text-cyan-200" />
                        </span>
                      </div>
                      <div className="min-w-0 self-center">
                        <div className="line-clamp-2 text-[13px] font-medium text-slate-200 group-hover:text-cyan-200">
                          {ep.title}
                        </div>
                        <div className="mt-0.5 text-[11px] text-slate-500">{ep.site}</div>
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Characters */}
            {(data.characters?.edges || []).length > 0 && (
              <section className="section">
                <SectionTitle jp="キャラクター" icon={Users}>Characters &amp; Cast</SectionTitle>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {data.characters.edges.map((edge) => (
                    <div
                      key={edge.node.id}
                      className="group overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.025] transition-all duration-300 hover:-translate-y-1 hover:border-pink-400/45"
                    >
                      <div className="relative overflow-hidden">
                        <img
                          src={edge.node.image?.large}
                          alt={edge.node.name?.full}
                          loading="lazy"
                          className="aspect-[3/4] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {edge.role && (
                          <span className="absolute left-2 top-2 rounded border border-white/15 bg-black/60 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-pink-200 backdrop-blur-sm">
                            {edge.role}
                          </span>
                        )}
                      </div>
                      <div className="p-2.5">
                        <div className="truncate text-[13px] font-medium text-slate-200">
                          {edge.node.name?.full}
                        </div>
                        {edge.voiceActors?.[0]?.name?.full && (
                          <div className="mt-0.5 truncate text-[11px] text-slate-500">
                            CV: {edge.voiceActors[0].name.full}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Watch order */}
            <section className="section">
              <SectionTitle jp="見る順番" icon={GitBranch}>Watch Order</SectionTitle>
              {watchEdges.length ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {watchEdges.map((e) => (
                    <button
                      key={e.node.id}
                      onClick={() => navigate(`/anime/${e.node.id}`)}
                      className="arc-card arc-bracket group text-left"
                    >
                      <div className="relative overflow-hidden">
                        <img
                          src={e.node.coverImage?.large}
                          alt=""
                          loading="lazy"
                          className="arc-poster aspect-[3/4] w-full object-cover"
                        />
                        <span className="arc-holo" />
                        <span className="absolute left-2 top-2 rounded-md border border-cyan-300/40 bg-black/65 px-1.5 py-0.5 text-[9px] font-bold tracking-widest text-cyan-200 backdrop-blur-sm">
                          {e.relationType.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="p-2.5">
                        <div className="line-clamp-2 text-[13px] font-medium text-slate-200 group-hover:text-cyan-200">
                          {e.node.title?.english || e.node.title?.romaji}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 py-10 text-center text-sm text-slate-500">
                  This title stands alone — no prequels, sequels or side stories listed.
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </article>
  )
}
