"use client";

import React, { useState } from "react";

interface ShareButtonProps {
  url: string;
  title: string;
}

export default function ShareButton({ url, title }: ShareButtonProps) {
  const [showCopyNotification, setShowCopyNotification] = useState(false);

  const handleShare = async () => {
    const shareUrl = typeof window !== "undefined" ? `${window.location.origin}${url}` : url;
    const shareText = `Check out this article: ${title}`;

    // Try using Web Share API if available
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Error sharing:", err);
        }
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        setShowCopyNotification(true);
        setTimeout(() => setShowCopyNotification(false), 2000);
      } catch (err) {
        console.error("Failed to copy to clipboard:", err);
      }
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleShare}
        className="flex items-center gap-2 px-4 py-2 rounded-full text-base font-medium transition-all duration-300 border bg-[rgba(255,255,255,0.03)] text-slate-400 border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.08)] hover:border-white/20 hover:text-white hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]"
        aria-label="Share this article"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.684 13.342C9.589 12.524 10 11.391 10 10c0-1.657-1.343-3-3-3s-3 1.343-3 3 1.343 3 3 3c.564 0 1.094-.113 1.585-.32m0 0a6.318 6.318 0 0 1 3.832 5.982v2.5m0 0a6.318 6.318 0 0 0-9.497-5.982m0 0A6.318 6.318 0 0 0 14.5 21"
          />
        </svg>
        <span>Share</span>
      </button>

      {showCopyNotification && (
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-green-500/20 border border-green-500/40 text-green-300 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap font-medium animate-pulse z-50">
          Link copied!
        </div>
      )}
    </div>
  );
}
