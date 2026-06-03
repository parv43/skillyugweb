"use client";

import React, { useState } from "react";
import Image from "next/image";

const galleryItems = [
  {
    src: "/classroom.webp",
    title: "AI Orientation at DWPS",
    story: "Bringing the future of tech directly into the classroom. An engaging session empowering young innovators at DWPS with foundational AI knowledge."
  },
  {
    src: "/dhruv-galgotia.webp",
    title: "Meeting Dr. Dhruv Galgotia",
    story: "Strategic discussions and visionary planning with Dr. Dhruv Galgotia, exploring avenues to scale impactful education and align our roadmaps."
  },
  {
    src: "/paytmAdvisor.webp",
    title: "Insights with Mr. Saurabh Jain",
    story: "An inspiring virtual masterclass with Mr. Saurabh Jain, former VP at Paytm, diving deep into startup mentorship and the evolution of tech ecosystems."
  },
  {
    src: "/vinita-singh-pic.webp",
    title: "Connecting with Vineeta Singh",
    story: "An incredible face-to-face interaction with SUGAR Cosmetics Founder & Shark Tank India Judge Mrs. Vineeta Singh, absorbing her dynamic entrepreneurial spirit."
  },
  {
    src: "/team-photo.webp",
    title: "The Skillyug Team",
    story: "The driving force behind the mission. A dedicated team of technologists and educators completely united by a passion to democratize AI learning."
  }
];

export default function GallerySection() {
  const [isPaused, setIsPaused] = useState(false);

  // ── Why 2× and -50%? ────────────────────────────────────────────────────────
  // With margin-right on each item (not CSS gap), every item carries its own
  // trailing space. So the total track width = 2 × (N items × item-width + N × gap).
  // Translating exactly -50% moves precisely one full set, making the loop seam
  // invisible. This is pixel-perfect — no repeating-decimal rounding like -33.333%.
  const items = [...galleryItems, ...galleryItems];

  return (
    <section className="py-24 relative overflow-hidden flex flex-col items-center justify-center border-t border-slate-100 bg-white">

      {/* ── CSS keyframe animation ─────────────────────────────────────────────
          GPU-composited: only "transform" is animated (no layout or paint).
          backface-visibility + translateZ(0) keep it on the compositor thread
          so production throttling / paint budget don't affect it.          */}
      <style>{`
        @keyframes gallery-marquee {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(-50%, 0, 0); }
        }
        .gallery-track {
          display: flex;
          width: max-content;
          animation: gallery-marquee 30s linear infinite;
          will-change: transform;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          transform: translate3d(0, 0, 0);
          -webkit-transform: translate3d(0, 0, 0);
        }
        .gallery-track.paused {
          animation-play-state: paused;
        }
        /* margin-right instead of gap — keeps each item's width self-contained
           so the -50% seam calculation stays exact on every screen size.    */
        .gallery-item {
          flex-shrink: 0;
          margin-right: 24px;
        }
        @media (min-width: 640px)  { .gallery-item { margin-right: 28px; } }
        @media (min-width: 1024px) { .gallery-item { margin-right: 32px; } }
      `}</style>

      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[800px] h-[600px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/5 via-purple-500/2 to-transparent rounded-full z-0 pointer-events-none" />

      <div className="text-center mb-12 relative z-10 w-full px-6">
        <h2 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 mb-6 tracking-tight leading-tight">
          Skillyug <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Gallery</span>
        </h2>
        <p className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-light font-body">
          See our Company in action.
        </p>
      </div>

      {/* Viewport clip — overflow-hidden hides the scroll seam */}
      <div className="relative w-full z-10 pt-4 pb-8 overflow-hidden">

        <div
          className={`gallery-track${isPaused ? " paused" : ""}`}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {items.map((item, index) => (
            <div
              key={index}
              className="gallery-item w-[280px] sm:w-[320px] md:w-[400px] lg:w-[480px] aspect-[4/3] rounded-2xl md:rounded-[3rem] overflow-hidden border border-slate-200 shadow-sm relative group select-none transition-all duration-500 hover:border-blue-300 hover:shadow-md"
            >
              {/* Story overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-900/50 to-transparent opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-all duration-500 z-20 pointer-events-none flex flex-col justify-end p-6 md:p-8">
                <h3 className="text-white font-bold text-xl md:text-2xl mb-2 translate-y-4 group-hover:translate-y-0 group-active:translate-y-0 transition-transform duration-500 ease-out delay-75">
                  {item.title}
                </h3>
                <p className="text-slate-200 text-sm md:text-base leading-relaxed translate-y-4 group-hover:translate-y-0 group-active:translate-y-0 transition-transform duration-500 ease-out delay-100 font-medium">
                  {item.story}
                </p>
              </div>

              <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors z-10 pointer-events-none" />
              <Image
                src={item.src}
                alt={`Skillyug Gallery - ${item.title}`}
                fill
                sizes="(max-width: 640px) 280px, (max-width: 768px) 320px, (max-width: 1024px) 400px, 480px"
                className="object-cover pointer-events-none transition-transform duration-700 group-hover:scale-110"
                priority={index < 5}
              />
            </div>
          ))}
        </div>

        {/* Edge fade gradients */}
        <div className="absolute top-0 bottom-0 left-0 w-20 md:w-48 bg-gradient-to-r from-white via-white/80 to-transparent z-20 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-20 md:w-48 bg-gradient-to-l from-white via-white/80 to-transparent z-20 pointer-events-none" />
      </div>

    </section>
  );
}
