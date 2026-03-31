"use client";

import { useTransition } from "react";
import { addReaction } from "@/app/articles/[id]/actions";

const REACTIONS = [
  { type: "like",  emoji: "👍", label: "いいね" },
  { type: "love",  emoji: "❤️", label: "すき" },
  { type: "laugh", emoji: "😂", label: "わらった" },
  { type: "wow",   emoji: "😮", label: "びっくり" },
  { type: "sad",   emoji: "😢", label: "かなしい" },
];

type Props = {
  commentId: string;
  articleId: string;
  counts: Record<string, number>;
};

export default function CommentReactions({ commentId, articleId, counts }: Props) {
  const [isPending, startTransition] = useTransition();

  const reacted = typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem(`reactions`) ?? "{}")
    : {};
  const alreadyReacted = !!reacted[commentId];

  function handleClick(type: string) {
    if (alreadyReacted || isPending) return;
    const stored = JSON.parse(localStorage.getItem(`reactions`) ?? "{}");
    stored[commentId] = type;
    localStorage.setItem(`reactions`, JSON.stringify(stored));
    startTransition(() => addReaction(commentId, type, articleId));
  }

  return (
    <div className="flex gap-1.5 mt-2 flex-wrap">
      {REACTIONS.map(({ type, emoji, label }) => {
        const count = counts[type] ?? 0;
        const isChosen = reacted[commentId] === type;
        return (
          <button
            key={type}
            onClick={() => handleClick(type)}
            disabled={alreadyReacted || isPending}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border transition-all
              ${isChosen
                ? "bg-yellow-100 border-yellow-400 text-yellow-700"
                : alreadyReacted
                  ? "bg-gray-50 border-gray-200 text-gray-400 cursor-default"
                  : "bg-white border-gray-200 text-gray-600 hover:border-yellow-400 hover:bg-yellow-50 cursor-pointer"
              }`}
            title={label}
          >
            <span>{emoji}</span>
            {count > 0 && <span>{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
