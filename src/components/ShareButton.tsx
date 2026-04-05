"use client";

import React, { useState } from "react";

interface ShareButtonProps {
  url: string;
  title: string;
}

export default function ShareButton({ url, title }: ShareButtonProps) {
  const [showCopyNotification, setShowCopyNotification] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const copyToClipboard = async (shareUrl: string) => {
    await navigator.clipboard.writeText(shareUrl);
    setShowCopyNotification(true);
    setTimeout(() => setShowCopyNotification(false), 2000);
  };

  const handleShare = async () => {
    if (isSharing) return;

    const shareUrl = typeof window !== "undefined" ? `${window.location.origin}${url}` : url;
    const shareText = `Check out this article: ${title}`;
    setIsSharing(true);

    try {
      // Try using Web Share API if available, then fall back to clipboard.
      if (typeof navigator !== "undefined" && navigator.share) {
        try {
          await navigator.share({
            title: title,
            text: shareText,
            url: shareUrl,
          });
        } catch (err) {
          const errorName = (err as Error).name;
          if (errorName === "AbortError") {
            return;
          }

          if (errorName === "InvalidStateError" || errorName === "NotAllowedError") {
            try {
              await copyToClipboard(shareUrl);
              return;
            } catch (copyErr) {
              console.error("Failed to copy to clipboard:", copyErr);
              return;
            }
          }

          console.error("Error sharing:", err);
        }
      } else {
        try {
          await copyToClipboard(shareUrl);
        } catch (err) {
          console.error("Failed to copy to clipboard:", err);
        }
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleShare}
        disabled={isSharing}
        className="flex items-center gap-2 px-4 py-2 rounded-full text-base font-medium transition-all duration-300 border bg-[rgba(255,255,255,0.03)] text-slate-400 border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.08)] hover:border-white/20 hover:text-white hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]"
        aria-label="Share this article"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M21.78 3.32a1 1 0 0 0-1.06-.22L3.94 10.06a1 1 0 0 0 .09 1.88l5.66 1.89 1.89 5.66a1 1 0 0 0 .8.67H12.5a1 1 0 0 0 .87-.5L21.9 4.38a1 1 0 0 0-.12-1.06ZM11 12.59l-3.5-1.17 8.84-3.68L11 12.59Zm1.41.41 4.85-4.85-3.68 8.84L12.41 13Z" />
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
