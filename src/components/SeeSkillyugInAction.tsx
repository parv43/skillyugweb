"use client"

import React, { useState, useRef, useEffect } from "react"
import { Play, ChevronLeft, ChevronRight } from "lucide-react"

interface Video {
  id: string;
  title: string;
  isShort?: boolean;
}

const CLASS_EXPERIENCE_VIDEOS: Video[] = [
  { id: "DuXqsto_tjM", title: "Class Experience 1" },
  { id: "clx6i0VY_c0", title: "Class Experience 2" },
  { id: "EQuDlXiu4ZE", title: "Class Experience 3" },
  { id: "H1Asz-rScQY", title: "Class Experience 4" },
];

const PARENT_STORIES_VIDEOS: Video[] = [
  { id: "-t6e8s-VrWU", title: "Parent Story 1", isShort: true },
  { id: "7a6lgtFDbwE", title: "Parent Story 2", isShort: true },
];

const LazyYouTube = ({ video, isActive, onActivate }: { video: Video, isActive: boolean, onActivate: () => void }) => {
  const isShort = video.isShort;
  const [imgSrc, setImgSrc] = useState(`https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg`);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (imgSrc.includes("maxresdefault")) {
      setImgSrc(`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`);
    } else if (imgSrc.includes("hqdefault")) {
      setImgSrc(`https://i.ytimg.com/vi/${video.id}/0.jpg`);
    } else {
      setHasError(true);
    }
  };
  
  return (
    <div 
      className={`relative w-full rounded-2xl overflow-hidden bg-slate-900 group shrink-0 snap-center shadow-sm border border-slate-200/50 dark:border-white/5 flex items-center justify-center ${
        isShort ? "aspect-[9/16]" : "aspect-video"
      }`}
    >
      {isActive ? (
        <iframe
          src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      ) : (
        <button
          onClick={onActivate}
          className="absolute inset-0 w-full h-full cursor-pointer focus:outline-none flex items-center justify-center"
          aria-label={`Play ${video.title}`}
        >
          {!hasError ? (
            <img
              src={imgSrc}
              alt={video.title}
              onError={handleError}
              onLoad={(e) => {
                if (e.currentTarget.naturalWidth === 120) {
                  handleError();
                }
              }}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <img
              src="/skillyug-optimized.svg"
              alt="Skillyug"
              className="w-1/2 h-auto object-contain opacity-40 transition-transform duration-700 group-hover:scale-105 group-hover:opacity-60"
            />
          )}
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 bg-[#ff0000] rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110">
              <Play className="w-6 h-6 text-white ml-1 fill-white" />
            </div>
          </div>
        </button>
      )}
    </div>
  );
};

const VideoCarousel = ({ title, videos, isShorts = false }: { title: string, videos: Video[], isShorts?: boolean }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    // Only auto-slide if user hasn't clicked a video and isn't hovering/interacting
    if (isPaused || activeVideoId) return;

    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        const maxScroll = scrollWidth - clientWidth;
        
        // If we reach the end, scroll back to start
        if (scrollLeft >= maxScroll - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          // Scroll by roughly one item width
          const itemWidth = isShorts 
            ? Math.min(280, clientWidth) 
            : clientWidth > 768 ? clientWidth / 2 : clientWidth;
            
          scrollRef.current.scrollBy({ left: itemWidth, behavior: "smooth" });
        }
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [isPaused, activeVideoId, isShorts]);

  const scroll = (direction: "left" | "right") => {
    setIsPaused(true); // Stop auto-sliding when user manually navigates
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const itemWidth = isShorts 
        ? Math.min(280, clientWidth) 
        : clientWidth > 768 ? clientWidth / 2 : clientWidth;
        
      scrollRef.current.scrollBy({ 
        left: direction === "left" ? -itemWidth : itemWidth, 
        behavior: "smooth" 
      });
    }
  };

  return (
    <div 
      className="flex flex-col mb-16"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
    >
      <div className="flex items-center justify-between mb-6 px-6 md:px-0">
        <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {title}
        </h3>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => scroll("left")}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0060aa]"
            aria-label={`Previous ${title}`}
          >
            <ChevronLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          </button>
          <button 
            onClick={() => scroll("right")}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0060aa]"
            aria-label={`Next ${title}`}
          >
            <ChevronRight className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          </button>
        </div>
      </div>

      {/* 
        Scroll container with CSS snap points. 
        Hide native scrollbars across browsers using tailwind arbitrary variants.
      */}
      <div 
        ref={scrollRef}
        className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory pb-4 px-6 md:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {videos.map((video) => (
          <div 
            key={video.id} 
            className={`snap-center shrink-0 ${
              isShorts 
                ? "w-[260px] md:w-[280px]" 
                : "w-[85vw] md:w-[calc(50%-12px)] lg:w-[calc(50%-12px)]"
            }`}
          >
            <LazyYouTube 
              video={video} 
              isActive={activeVideoId === video.id}
              onActivate={() => {
                setActiveVideoId(video.id);
                setIsPaused(true);
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default function SeeSkillyugInAction() {
  return (
    <section className="relative w-full bg-slate-50 dark:bg-[#020817] py-20 md:py-28 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#0060aa]/10 dark:bg-[#0060aa]/5 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#ff8b12]/10 dark:bg-[#ff8b12]/5 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-[1200px] mx-auto px-0 md:px-8">
        <div className="text-center mb-14 md:mb-20 px-6">
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-blue-100/50 dark:bg-blue-900/30 text-[#0060aa] dark:text-blue-300 font-bold text-xs mb-4 border border-blue-200/50 dark:border-blue-800/30 uppercase tracking-[0.2em]">
            Video Gallery
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight leading-tight">
            See SKILLYUG in Action
          </h2>
          <p className="text-base md:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#0060aa] via-[#8b5cf6] to-[#ff8b12] max-w-2xl mx-auto">
            Real classes. Real learning. Real parent experiences.
          </p>
        </div>

        <VideoCarousel title="Class Experience" videos={CLASS_EXPERIENCE_VIDEOS} />
        <VideoCarousel title="Parent Stories" videos={PARENT_STORIES_VIDEOS} isShorts={true} />
      </div>
    </section>
  );
}
