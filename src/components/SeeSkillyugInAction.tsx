"use client"

import React, {
  useState,
  useEffect,
  useCallback,
  memo,
} from "react"
import { Play, ChevronLeft, ChevronRight } from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Video {
  id: string
  title: string
  isShort?: boolean
}

// ─── Data (IDs unchanged) ─────────────────────────────────────────────────────

const CLASS_EXPERIENCE_VIDEOS: Video[] = [
  { id: "DuXqsto_tjM", title: "Class Experience 1" },
  { id: "clx6i0VY_c0", title: "Class Experience 2" },
  { id: "EQuDlXiu4ZE", title: "Class Experience 3" },
  { id: "H1Asz-rScQY", title: "Class Experience 4" },
]

const PARENT_STORIES_VIDEOS: Video[] = [
  { id: "-t6e8s-VrWU", title: "Parent Story 1", isShort: true },
  { id: "7a6lgtFDbwE", title: "Parent Story 2", isShort: true },
]

// ─── Lazy YouTube Card ────────────────────────────────────────────────────────

interface VideoCardProps {
  video: Video
  isActive: boolean
  onActivate: () => void
  lazy?: boolean
}

const VideoCard = memo(function VideoCard({
  video,
  isActive,
  onActivate,
  lazy = true,
}: VideoCardProps) {
  const isShort = video.isShort
  const [imgSrc, setImgSrc] = useState(
    `https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg`
  )
  const [imgError, setImgError] = useState(false)

  const handleImgError = useCallback(() => {
    setImgSrc((prev) => {
      if (prev.includes("maxresdefault")) {
        return `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`
      }
      if (prev.includes("hqdefault")) {
        return `https://i.ytimg.com/vi/${video.id}/sddefault.jpg`
      }
      setImgError(true)
      return prev
    })
  }, [video.id])

  const handleImgLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      if (e.currentTarget.naturalWidth === 120) {
        handleImgError()
      }
    },
    [handleImgError]
  )

  const aspectClass = isShort ? "aspect-[9/16]" : "aspect-video"

  return (
    <div
      className={`relative w-full overflow-hidden bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-white/[0.06] shadow-sm group ${aspectClass}`}
      style={{ contain: "layout paint" }}
    >
      {isActive ? (
        <iframe
          src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1`}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          className="absolute inset-0 w-full h-full border-0 rounded-2xl"
        />
      ) : (
        <button
          onClick={onActivate}
          className="absolute inset-0 w-full h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0060aa] focus-visible:ring-offset-2 rounded-2xl"
          aria-label={`Play ${video.title}`}
          type="button"
        >
          {!imgError ? (
            <img
              src={imgSrc}
              alt={video.title}
              width={isShort ? 360 : 1280}
              height={isShort ? 640 : 720}
              onError={handleImgError}
              onLoad={handleImgLoad}
              loading={lazy ? "lazy" : "eager"}
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              style={{ willChange: "transform" }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-900">
              <img
                src="/skillyug-optimized.svg"
                alt="Skillyug"
                className="w-1/3 h-auto object-contain opacity-30"
                loading="lazy"
              />
            </div>
          )}

          {/* Subtle overlay */}
          <span
            className="absolute inset-0 bg-black/20 transition-opacity duration-300 group-hover:bg-black/10 rounded-2xl"
            aria-hidden="true"
          />

          {/* Play button */}
          <span
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            aria-hidden="true"
          >
            <span className="flex items-center justify-center w-14 h-14 rounded-full bg-white/95 shadow-md transition-transform duration-200 group-hover:scale-110 group-active:scale-95">
              <Play
                className="w-5 h-5 text-slate-900 fill-slate-900 ml-0.5"
                aria-hidden="true"
              />
            </span>
          </span>
        </button>
      )}
    </div>
  )
})

// ─── Class Experience Carousel (2-up pair navigation) ────────────────────────

const PAIR_SIZE = 2
const AUTO_ADVANCE_MS = 6000

function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduced(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])
  return reduced
}

function ClassExperienceCarousel({ videos }: { videos: Video[] }) {
  const totalPairs = Math.ceil(videos.length / PAIR_SIZE)
  const [pairIndex, setPairIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  const navigate = useCallback(
    (direction: "prev" | "next") => {
      if (isTransitioning) return
      setIsTransitioning(true)
      setActiveVideoId(null)
      setPairIndex((prev) => {
        if (direction === "next") return (prev + 1) % totalPairs
        return (prev - 1 + totalPairs) % totalPairs
      })
      setTimeout(() => setIsTransitioning(false), prefersReducedMotion ? 0 : 320)
    },
    [isTransitioning, totalPairs, prefersReducedMotion]
  )

  // Auto-advance with Page Visibility API
  useEffect(() => {
    if (prefersReducedMotion || isPaused || activeVideoId || totalPairs <= 1) return

    const handleVisibility = () => {
      if (document.hidden) setIsPaused(true)
      else setIsPaused(false)
    }
    document.addEventListener("visibilitychange", handleVisibility)

    const timer = setInterval(() => {
      if (!document.hidden) navigate("next")
    }, AUTO_ADVANCE_MS)

    return () => {
      clearInterval(timer)
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [isPaused, activeVideoId, navigate, prefersReducedMotion, totalPairs])

  const currentPair = videos.slice(
    pairIndex * PAIR_SIZE,
    pairIndex * PAIR_SIZE + PAIR_SIZE
  )

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setTimeout(() => setIsPaused(false), 4000)}
    >
      {/* Sub-header + navigation */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
          Class Experience
        </h3>

        <div className="flex items-center gap-3">
          {/* Dot indicators */}
          <div className="flex gap-1.5" role="tablist" aria-label="Pair navigation">
            {Array.from({ length: totalPairs }).map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === pairIndex}
                aria-label={`Pair ${i + 1} of ${totalPairs}`}
                onClick={() => {
                  if (i !== pairIndex && !isTransitioning) {
                    setIsTransitioning(true)
                    setActiveVideoId(null)
                    setPairIndex(i)
                    setTimeout(
                      () => setIsTransitioning(false),
                      prefersReducedMotion ? 0 : 320
                    )
                  }
                }}
                className={`h-1.5 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0060aa] ${
                  i === pairIndex
                    ? "w-5 bg-[#0060aa]"
                    : "w-1.5 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500"
                }`}
              />
            ))}
          </div>

          {/* Prev / Next arrows */}
          <div className="flex items-center gap-1.5 ml-1">
            <button
              onClick={() => navigate("prev")}
              disabled={isTransitioning}
              aria-label="Previous pair"
              className="w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0060aa] disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4 text-slate-700 dark:text-slate-300" aria-hidden="true" />
            </button>
            <button
              onClick={() => navigate("next")}
              disabled={isTransitioning}
              aria-label="Next pair"
              className="w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0060aa] disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4 text-slate-700 dark:text-slate-300" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* 2-up grid — full CSS transition, no scroll overflow */}
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 transition-all ${
          prefersReducedMotion ? "" : "duration-300 ease-out"
        } ${isTransitioning ? "opacity-0 translate-y-1" : "opacity-100 translate-y-0"}`}
        style={{ willChange: "opacity, transform" }}
        aria-live="polite"
        aria-atomic="true"
      >
        {currentPair.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            isActive={activeVideoId === video.id}
            lazy
            onActivate={() => {
              setActiveVideoId(video.id)
              setIsPaused(true)
            }}
          />
        ))}
        {/* Spacer for odd last pair on desktop */}
        {currentPair.length === 1 && (
          <div className="hidden sm:block" aria-hidden="true" />
        )}
      </div>
    </div>
  )
}

// ─── Parent Stories (static 2-column portrait grid) ───────────────────────────

function ParentStoriesGrid({ videos }: { videos: Video[] }) {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null)

  return (
    <div>
      <h3 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight mb-5">
        Parent Stories
      </h3>

      {/* Centered 2-column portrait grid — no carousel */}
      <div className="flex justify-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8 w-full max-w-2xl">
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              isActive={activeVideoId === video.id}
              lazy
              onActivate={() => setActiveVideoId(video.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Section ──────────────────────────────────────────────────────────────────

export default function SeeSkillyugInAction() {
  return (
    <section
      id="see-skillyug-in-action"
      aria-label="See SKILLYUG in Action – Video Gallery"
      className="relative w-full bg-slate-50/80 dark:bg-[#020817] py-16 md:py-24 overflow-hidden"
    >
      {/* Subtle tinted blobs — kept light, non-distracting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-[10%] left-[-8%] w-[35%] h-[40%] rounded-full bg-[#0060aa]/8 dark:bg-[#0060aa]/5 blur-[100px]" />
        <div className="absolute bottom-[8%] right-[-8%] w-[35%] h-[40%] rounded-full bg-[#ff8b12]/8 dark:bg-[#ff8b12]/5 blur-[100px]" />
      </div>

      {/* Content container — max-w-5xl keeps cards from becoming too wide */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-5 sm:px-8">

        {/* ── Section Header ── */}
        <div className="text-center mb-12 md:mb-16">
          {/* Eyebrow pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0060aa] dark:bg-blue-400 shrink-0" aria-hidden="true" />
            <span className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#0060aa] dark:text-blue-300">
              Video Gallery
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-[3.25rem] font-black text-slate-900 dark:text-white tracking-[-0.03em] leading-[1.08] mb-4">
            See SKILLYUG{" "}
            <span className="text-[#0060aa] dark:text-blue-400">in Action</span>
          </h2>

          <p className="text-base md:text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#0060aa] via-[#8b5cf6] to-[#ff8b12] tracking-wide">
            Real classes. Real learning. Real parent experiences.
          </p>
        </div>

        {/* ── Class Experience ── */}
        <div className="mb-14 md:mb-20">
          <ClassExperienceCarousel videos={CLASS_EXPERIENCE_VIDEOS} />
        </div>

        {/* Thin divider */}
        <div className="w-10 h-px bg-slate-200 dark:bg-white/10 mx-auto mb-12 md:mb-16" aria-hidden="true" />

        {/* ── Parent Stories ── */}
        <ParentStoriesGrid videos={PARENT_STORIES_VIDEOS} />
      </div>
    </section>
  )
}
