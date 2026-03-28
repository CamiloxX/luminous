"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import ShareButton from "@/components/ui/ShareButton";
import UserBadges from "@/components/ui/UserBadges";
import type { FeedQuestion } from "./page";

interface Props {
  questions: FeedQuestion[];
  community: FeedQuestion[];
  trending: FeedQuestion[];
  userId: string | null;
}

export default function HomeFeed({ questions, community, trending, userId }: Props) {
  return (
    <>
      {/* Ask Prompt */}
      <section className="mb-12">
        <div className="bg-[#f1efff] dark:bg-white/5 rounded-[1.5rem] p-8 flex flex-col md:flex-row items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0052d0] to-[#8d3a8b] flex items-center justify-center p-0.5 shadow-lg">
            <div className="w-full h-full rounded-full bg-white dark:bg-[#07091e] flex items-center justify-center">
              <span className="material-symbols-outlined text-[#0052d0] text-3xl">psychology</span>
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-extrabold text-[#272b51] dark:text-[#c8ccf0] tracking-tight mb-1"
              style={{ fontFamily: "var(--font-plus-jakarta)" }}>
              ¿Qué tienes en mente?
            </h1>
            <p className="text-[#545881] dark:text-[#969ac6] text-sm">
              Lanza una pregunta anónima a toda la comunidad.
            </p>
          </div>
          {userId ? (
            <button id="open-ask-modal"
              className="bg-gradient-to-br from-[#0052d0] to-[#799dff] text-white font-bold py-4 px-8 rounded-full shadow-[0_12px_32px_rgba(0,82,208,0.2)] active:scale-95 transition-all whitespace-nowrap">
              Preguntar
            </button>
          ) : (
            <Link href="/register"
              className="bg-gradient-to-br from-[#0052d0] to-[#799dff] text-white font-bold py-4 px-8 rounded-full shadow-[0_12px_32px_rgba(0,82,208,0.2)] active:scale-95 transition-all whitespace-nowrap">
              Únete para preguntar
            </Link>
          )}
        </div>
      </section>

      {/* Trending */}
      {trending.length > 0 && (
        <section className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-extrabold tracking-tight text-[#272b51] dark:text-[#c8ccf0]"
              style={{ fontFamily: "var(--font-plus-jakarta)" }}>
              Trending
            </h2>
            <span className="bg-[#f797f0] text-[#610e63] text-xs font-bold px-3 py-1 rounded-full">LIVE</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            <TrendingFeatured question={trending[0]} userId={userId} />
            {trending.slice(1).map((q) => <TrendingSmall key={q.id} question={q} />)}
          </div>
        </section>
      )}

      {/* Community unanswered questions */}
      {community.length > 0 && (
        <section className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-3xl font-extrabold tracking-tight text-[#272b51] dark:text-[#c8ccf0]"
              style={{ fontFamily: "var(--font-plus-jakarta)" }}>
              Sin responder
            </h2>
            <span className="bg-[#ede7f6] text-[#4527a0] text-xs font-bold px-3 py-1 rounded-full">
              {community.length} preguntas
            </span>
          </div>
          <div className="space-y-4">
            {community.map((q) => (
              <CommunityCard key={q.id} question={q} userId={userId} />
            ))}
          </div>
        </section>
      )}

      {/* Answered feed */}
      <section>
        <h2 className="text-3xl font-extrabold tracking-tight text-[#272b51] dark:text-[#c8ccf0] mb-8"
          style={{ fontFamily: "var(--font-plus-jakarta)" }}>
          Respuestas recientes
        </h2>
        {questions.length > 0 ? (
          <div className="space-y-6">
            {questions.map((q) => <FeedCard key={q.id} question={q} userId={userId} />)}
          </div>
        ) : (
          <div className="text-center py-20 bg-[#f1efff] dark:bg-white/5 rounded-[1.5rem]">
            <span className="material-symbols-outlined text-[#a6aad7] text-6xl mb-4 block">chat_bubble_outline</span>
            <p className="text-[#272b51] dark:text-[#c8ccf0] font-bold text-lg">Todavía no hay respuestas</p>
            <p className="text-[#545881] dark:text-[#969ac6] text-sm mt-1">¡Sé el primero en preguntar!</p>
          </div>
        )}
      </section>
    </>
  );
}

/* ── Community card (unanswered, anyone can reply) ── */
function CommunityCard({ question, userId }: { question: FeedQuestion; userId: string | null }) {
  const [expanded, setExpanded] = useState(false);
  const [answer, setAnswer] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleAnswer(e: React.FormEvent) {
    e.preventDefault();
    if (!answer.trim() || !userId) return;
    setLoading(true);
    const supabase = createClient();
    await supabase.from("questions").update({
      answer: answer.trim(),
      answered_at: new Date().toISOString(),
    }).eq("id", question.id);
    setDone(true);
  }

  if (done) return null;

  const timeAgo = formatTimeAgo(question.created_at);

  return (
    <div className="bg-white dark:bg-[#111328] rounded-[1.5rem] overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#a33800] to-[#ffc4af] flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-white text-sm"
              style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-[#545881] dark:text-[#969ac6] uppercase tracking-widest mb-1">
              Anónimo · {timeAgo}
            </p>
            <p className="text-[#272b51] dark:text-[#c8ccf0] font-medium leading-relaxed">
              {question.content}
            </p>
          </div>
        </div>

        {userId && !expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-[#f1efff] dark:bg-white/10 hover:bg-[#e6e6ff] dark:hover:bg-white/20 text-[#0052d0] dark:text-[#5e8bff] font-bold py-3 rounded-[1rem] transition-colors text-sm"
          >
            <span className="material-symbols-outlined text-lg">reply</span>
            Responder
          </button>
        )}
      </div>

      {expanded && userId && (
        <form onSubmit={handleAnswer} className="px-5 pb-5 space-y-3 border-t border-[#f1efff] dark:border-white/5 pt-4">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            maxLength={1000}
            rows={3}
            autoFocus
            placeholder="Escribe tu respuesta..."
            className="w-full bg-[#f8f5ff] dark:bg-white/10 dark:text-[#c8ccf0] rounded-[1rem] py-3 px-4 text-[#272b51] placeholder:text-[#a6aad7] focus:outline-none focus:ring-2 focus:ring-[#0052d0]/30 resize-none transition text-sm"
          />
          <div className="flex gap-2">
            <button type="button" onClick={() => setExpanded(false)}
              className="flex-1 py-3 rounded-full bg-[#f1efff] dark:bg-white/10 text-[#545881] dark:text-[#969ac6] font-bold text-sm">
              Cancelar
            </button>
            <button type="submit" disabled={!answer.trim() || loading}
              className="flex-1 py-3 rounded-full bg-gradient-to-br from-[#0052d0] to-[#799dff] text-white font-bold text-sm shadow-[0_4px_12px_rgba(0,82,208,0.2)] disabled:opacity-50 active:scale-95 transition-all">
              {loading ? "Publicando..." : "Publicar"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

/* ── Trending featured card ── */
function TrendingFeatured({ question, userId }: { question: FeedQuestion; userId: string | null }) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(question.likes_count);

  async function toggleLike() {
    if (!userId) return;
    const supabase = createClient();
    if (liked) {
      await supabase.from("likes").delete().match({ user_id: userId, question_id: question.id });
      setCount((c) => c - 1);
    } else {
      await supabase.from("likes").insert({ user_id: userId, question_id: question.id });
      setCount((c) => c + 1);
    }
    setLiked((v) => !v);
  }

  return (
    <div className="md:col-span-8 bg-[#d8daff] dark:bg-[#0052d0]/20 rounded-[1.5rem] p-8 relative overflow-hidden group hover:bg-[#ced1ff] dark:hover:bg-[#0052d0]/30 transition-colors duration-500">
      <div className="absolute top-0 right-0 p-4">
        <span className="material-symbols-outlined text-[#0052d0]/20 text-8xl rotate-12 group-hover:rotate-0 transition-transform duration-700">format_quote</span>
      </div>
      <div className="relative z-10">
        {question.profiles && (
          <Link href={`/u/${question.profiles.username}`} className="flex items-center gap-3 mb-5 w-fit">
            <ProfileAvatar profile={question.profiles} size="sm" />
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-[#272b51] dark:text-[#c8ccf0] text-sm"
                  style={{ fontFamily: "var(--font-plus-jakarta)" }}>
                  {question.profiles.display_name ?? question.profiles.username}
                </p>
                <UserBadges badge={question.profiles.badge ?? null} isVerified={question.profiles.is_verified ?? false} size="sm" />
              </div>
              <p className="text-xs text-[#545881] dark:text-[#969ac6]">@{question.profiles.username}</p>
            </div>
          </Link>
        )}
        <p className="text-xs text-[#545881] dark:text-[#969ac6] uppercase tracking-widest mb-3 font-semibold">Anónimo preguntó</p>
        <h3 className="text-xl font-bold text-[#272b51] dark:text-[#c8ccf0] leading-tight mb-4"
          style={{ fontFamily: "var(--font-plus-jakarta)" }}>
          &ldquo;{question.content}&rdquo;
        </h3>
        {question.answer && (
          <p className="text-[#272b51]/70 dark:text-[#c8ccf0]/70 text-sm leading-relaxed mb-6 line-clamp-2">{question.answer}</p>
        )}
        <button onClick={toggleLike}
          className={`flex items-center gap-2 font-bold transition-colors ${liked ? "text-[#b31b25]" : "text-[#0052d0] dark:text-[#5e8bff]"}`}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: liked ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
          {count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count}
        </button>
      </div>
    </div>
  );
}

function TrendingSmall({ question }: { question: FeedQuestion }) {
  return (
    <Link href={question.profiles ? `/u/${question.profiles.username}` : "#"}
      className="md:col-span-4 bg-[#f1efff] dark:bg-white/5 rounded-[1.5rem] p-6 flex flex-col justify-between hover:bg-[#dfe0ff] dark:hover:bg-white/10 transition-colors">
      <div className="mb-4">
        <div className="w-8 h-8 rounded-full bg-[#799dff] mb-4 flex items-center justify-center">
          <span className="material-symbols-outlined text-white text-sm">bolt</span>
        </div>
        <p className="font-semibold text-[#272b51] dark:text-[#c8ccf0] leading-snug text-sm line-clamp-3">{question.content}</p>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-xs text-[#545881] dark:text-[#969ac6] flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">favorite</span>{question.likes_count}
        </span>
        <span className="text-[#0052d0] dark:text-[#5e8bff] material-symbols-outlined">arrow_forward</span>
      </div>
    </Link>
  );
}

/* ── Answered feed card ── */
function FeedCard({ question, userId }: { question: FeedQuestion; userId: string | null }) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(question.likes_count);
  const timeAgo = formatTimeAgo(question.answered_at ?? question.created_at);

  async function toggleLike() {
    if (!userId) return;
    const supabase = createClient();
    if (liked) {
      await supabase.from("likes").delete().match({ user_id: userId, question_id: question.id });
      setCount((c) => c - 1);
    } else {
      await supabase.from("likes").insert({ user_id: userId, question_id: question.id });
      setCount((c) => c + 1);
    }
    setLiked((v) => !v);
  }

  return (
    <article className="bg-white dark:bg-[#111328] rounded-[1.5rem] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-shadow">
      {question.profiles && (
        <Link href={`/u/${question.profiles.username}`} className="flex items-center gap-3 mb-5">
          <ProfileAvatar profile={question.profiles} size="md" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-[#272b51] dark:text-[#c8ccf0]"
                style={{ fontFamily: "var(--font-plus-jakarta)" }}>
                {question.profiles.display_name ?? question.profiles.username}
              </p>
              <UserBadges
                badge={question.profiles.badge ?? null}
                isVerified={question.profiles.is_verified ?? false}
                size="sm"
              />
            </div>
            <p className="text-xs text-[#545881] dark:text-[#969ac6]">@{question.profiles.username} · {timeAgo}</p>
          </div>
        </Link>
      )}

      <div className="bg-[#f1efff] dark:bg-white/5 rounded-[1rem] px-5 py-4 mb-4">
        <p className="text-xs font-bold text-[#545881] dark:text-[#969ac6] uppercase tracking-widest mb-1">Anónimo preguntó</p>
        <p className="text-[#272b51] dark:text-[#c8ccf0] font-medium leading-relaxed">{question.content}</p>
      </div>
      {question.answer && (
        <p className="text-[#272b51] dark:text-[#c8ccf0] leading-relaxed mb-5 px-1">{question.answer}</p>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-[#f1efff] dark:border-white/5">
        <button onClick={toggleLike}
          className={`flex items-center gap-2 transition-colors ${liked ? "text-[#b31b25]" : "text-[#545881] dark:text-[#969ac6] hover:text-[#b31b25]"}`}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: liked ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
          <span className="text-sm font-semibold">{count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count}</span>
        </button>
        {question.profiles && (
          <ShareButton username={question.profiles.username} questionId={question.id} questionContent={question.content} />
        )}
      </div>
    </article>
  );
}

type Profile = { username: string; display_name: string | null; avatar_url: string | null };
function ProfileAvatar({ profile, size }: { profile: Profile; size: "sm" | "md" }) {
  const dim = size === "sm" ? "w-9 h-9" : "w-11 h-11";
  if (profile.avatar_url) {
    return <img src={profile.avatar_url} alt={profile.username} className={`${dim} rounded-full object-cover`} />;
  }
  return (
    <div className={`${dim} rounded-full bg-gradient-to-br from-[#0052d0] to-[#8d3a8b] flex items-center justify-center flex-shrink-0`}>
      <span className="material-symbols-outlined text-white text-sm"
        style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
    </div>
  );
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
