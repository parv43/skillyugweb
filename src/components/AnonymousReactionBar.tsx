"use client";

import React, { useState, useEffect } from "react";
import { toggleAnonymousReaction } from "@/app/actions/reactions";

interface AnonymousReactionBarProps {
  itemId: string;
  initialCounts?: Record<string, number>;
}

const REACTIONS = [
  { type: "love", emoji: "❤️" },
  { type: "like", emoji: "👍" },
  { type: "dislike", emoji: "👎" },
  { type: "laugh", emoji: "😂" },
];

function generateGuestId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function AnonymousReactionBar({ itemId, initialCounts = {} }: AnonymousReactionBarProps) {
  const [guestId, setGuestId] = useState<string | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>(initialCounts);
  const [activeReactions, setActiveReactions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let storedGuestId = localStorage.getItem("skillyug_guest_id");
    if (!storedGuestId) {
      storedGuestId = generateGuestId();
      localStorage.setItem("skillyug_guest_id", storedGuestId);
    }
    setGuestId(storedGuestId);
  }, []);

  const handleToggle = async (reactionType: string) => {
    if (!guestId) return;

    const isActive = activeReactions[reactionType];
    const newIsActive = !isActive;

    // Optimistic UI update
    setActiveReactions((prev) => ({
      ...prev,
      [reactionType]: newIsActive,
    }));

    setCounts((prev) => {
      const currentCount = prev[reactionType] || 0;
      return {
        ...prev,
        [reactionType]: newIsActive ? currentCount + 1 : Math.max(0, currentCount - 1),
      };
    });

    try {
      // Trigger background server action
      const result = await toggleAnonymousReaction(itemId, reactionType, guestId);
      
      // If the backend state doesn't match our optimistic intent, sync it
      if (result.action === "added" && !newIsActive) {
        setActiveReactions((prev) => ({ ...prev, [reactionType]: true }));
        setCounts((prev) => ({ ...prev, [reactionType]: (prev[reactionType] || 0) + 1 }));
      } else if (result.action === "removed" && newIsActive) {
         setActiveReactions((prev) => ({ ...prev, [reactionType]: false }));
         setCounts((prev) => ({ ...prev, [reactionType]: Math.max(0, (prev[reactionType] || 0) - 1) }));
      }
    } catch (error) {
      console.error("Error toggling reaction:", error);
      // Revert optimistic update on error
      setActiveReactions((prev) => ({
        ...prev,
        [reactionType]: isActive,
      }));
      setCounts((prev) => {
        const currentCount = prev[reactionType] || 0;
        return {
          ...prev,
          [reactionType]: isActive ? currentCount + 1 : Math.max(0, currentCount - 1),
        };
      });
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {REACTIONS.map((reaction) => {
        const count = counts[reaction.type] || 0;
        const isActive = activeReactions[reaction.type];

        return (
          <button
            key={reaction.type}
            onClick={() => handleToggle(reaction.type)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-base font-medium transition-all duration-300 border ${
              isActive
                ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white border-purple-500/40 shadow-[0_0_15px_rgba(139,92,246,0.2)] scale-105"
                : "bg-[rgba(255,255,255,0.03)] text-slate-400 border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.08)] hover:border-white/20 hover:text-white"
            }`}
            aria-label={`React with ${reaction.type}`}
          >
            <span>{reaction.emoji}</span>
            {count > 0 && <span className="text-sm font-semibold">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
