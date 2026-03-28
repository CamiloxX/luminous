"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";
import ShareButton from "@/components/ui/ShareButton";

type Question = Database["public"]["Tables"]["questions"]["Row"];

interface Props {
  questions: Question[];
  isOwner: boolean;
  username: string;
}

export default function AnsweredQuestions({ questions, isOwner, username }: Props) {
  return (
    <div className="space-y-6">
      {questions.map((q) => (
        <QuestionItem key={q.id} question={q} isOwner={isOwner} username={username} />
      ))}
    </div>
  );
}

function QuestionItem({ question, isOwner, username }: { question: Question; isOwner: boolean; username: string }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(question.likes_count);
  const [loadingLike, setLoadingLike] = useState(false);

  async function handleLike() {
    if (loadingLike) return;
    setLoadingLike(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoadingLike(false); return; }

    if (liked) {
      await supabase.from("likes").delete().match({ user_id: user.id, question_id: question.id });
      setLikeCount((c) => c - 1);
      setLiked(false);
    } else {
      await supabase.from("likes").insert({ user_id: user.id, question_id: question.id });
      setLikeCount((c) => c + 1);
      setLiked(true);
    }
    setLoadingLike(false);
  }

  const timeAgo = formatTimeAgo(question.answered_at ?? question.created_at);

  return (
    <article className="bg-white dark:bg-[#111328] rounded-[1.5rem] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
      {/* Question */}
      <div className="flex items-start gap-3 mb-5">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#a33800] to-[#ffc4af] flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
            person
          </span>
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold text-[#545881] dark:text-[#969ac6] uppercase tracking-widest mb-1">
            {question.is_anonymous ? "Anónimo preguntó" : "Alguien preguntó"}
          </p>
          <p className="text-[#272b51] dark:text-[#c8ccf0] font-medium leading-relaxed">{question.content}</p>
        </div>
      </div>

      {/* Answer */}
      {question.answer && (
        <div className="bg-[#f1efff] dark:bg-white/5 rounded-[1rem] p-4 mb-5">
          <p className="text-[#272b51] dark:text-[#c8ccf0] leading-relaxed">{question.answer}</p>
          <p className="text-xs text-[#a6aad7] mt-2">{timeAgo}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-[#e6e6ff] dark:border-white/5">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 transition-colors ${
            liked ? "text-[#b31b25]" : "text-[#545881] dark:text-[#969ac6] hover:text-[#b31b25]"
          }`}
        >
          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: liked ? "'FILL' 1" : "'FILL' 0" }}>
            favorite
          </span>
          <span className="text-sm font-semibold">
            {likeCount >= 1000 ? `${(likeCount / 1000).toFixed(1)}k` : likeCount}
          </span>
        </button>

        <ShareButton username={username} questionId={question.id} questionContent={question.content} />
      </div>
    </article>
  );
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}
