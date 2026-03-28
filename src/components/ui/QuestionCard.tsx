"use client";

interface QuestionCardProps {
  username: string;
  timeAgo: string;
  content: string;
  likesCount: number;
  answersCount: number;
  isAnonymous?: boolean;
  avatarUrl?: string;
}

export default function QuestionCard({
  username,
  timeAgo,
  content,
  likesCount,
  answersCount,
  isAnonymous = false,
  avatarUrl,
}: QuestionCardProps) {
  return (
    <article className="bg-surface-container-lowest rounded-[1.5rem] p-8 shadow-[0_12px_32px_rgba(0,0,0,0.04)] hover:scale-[1.01] transition-transform duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {isAnonymous || !avatarUrl ? (
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-secondary to-secondary-container flex items-center justify-center shadow-inner">
              <span
                className="material-symbols-outlined text-white"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                person
              </span>
            </div>
          ) : (
            <img
              src={avatarUrl}
              alt={username}
              className="w-12 h-12 rounded-full ring-2 ring-primary/10 p-0.5 object-cover"
            />
          )}
          <div>
            <p
              className="font-bold text-on-surface"
              style={{ fontFamily: "var(--font-plus-jakarta)" }}
            >
              {isAnonymous ? "Anonymous" : username}
            </p>
            <p className="text-xs text-on-surface-variant">{timeAgo}</p>
          </div>
        </div>
        <button className="material-symbols-outlined text-outline hover:text-on-surface transition-colors">
          more_horiz
        </button>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-medium text-on-surface leading-relaxed">
          {content}
        </h3>
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-surface-container">
        <div className="flex gap-6">
          <button className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined">favorite</span>
            <span className="text-sm font-semibold">
              {likesCount >= 1000
                ? `${(likesCount / 1000).toFixed(1)}k`
                : likesCount}
            </span>
          </button>
          <button className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined">chat_bubble</span>
            <span className="text-sm font-semibold">
              {answersCount > 0 ? `${answersCount} Answers` : "Answer"}
            </span>
          </button>
        </div>
        <button className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined">share</span>
          <span className="text-sm font-semibold">Share</span>
        </button>
      </div>
    </article>
  );
}
