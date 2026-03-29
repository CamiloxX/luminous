"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ShareButton from "@/components/ui/ShareButton";
import UserBadges from "@/components/ui/UserBadges";
import type { FeedQuestion, TopUser } from "./page";

interface Props {
  questions: FeedQuestion[];
  community: FeedQuestion[];
  trending: FeedQuestion[];
  topUsers: TopUser[];
  userId: string | null;
}

const REP_TIERS = [
  { min: 1000, label: "Leyenda", icon: "crown", color: "text-amber-500" },
  { min: 500,  label: "Influyente", icon: "diamond", color: "text-purple-500" },
  { min: 200,  label: "Popular", icon: "local_fire_department", color: "text-orange-500" },
  { min: 50,   label: "En ascenso", icon: "trending_up", color: "text-blue-500" },
  { min: 0,    label: "Nuevo", icon: "eco", color: "text-green-500" },
];
function getTier(rep: number) {
  return REP_TIERS.find((t) => rep >= t.min) ?? REP_TIERS[REP_TIERS.length - 1];
}

export default function HomeFeed({ questions, community, trending, topUsers, userId }: Props) {
  return (
    <>
      {/* Ask Prompt */}
      <section className="mb-12">
        <CommunityAskBox userId={userId} />
      </section>

      {/* Trending Ask Done */}
      {trending.length > 0 && (
        <section className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-[#272b51] dark:text-[#c8ccf0]"
                style={{ fontFamily: "var(--font-plus-jakarta)" }}>
                Trending Ask Done
              </h2>
              <p className="text-sm text-[#545881] dark:text-[#969ac6] mt-0.5">Las preguntas más votadas</p>
            </div>
            <span className="bg-[#f797f0] text-[#610e63] text-xs font-bold px-3 py-1 rounded-full animate-pulse">🔥 LIVE</span>
          </div>

          {/* Featured top card */}
          <TrendingFeatured question={trending[0]} userId={userId} />

          {/* Grid of remaining */}
          {trending.length > 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {trending.slice(1).map((q, i) => (
                <TrendingCard key={q.id} question={q} userId={userId} rank={i + 2} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Community unanswered questions */}
      <section className="mb-14" id="sin-responder">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-3xl font-extrabold tracking-tight text-[#272b51] dark:text-[#c8ccf0]"
            style={{ fontFamily: "var(--font-plus-jakarta)" }}>
            Sin responder
          </h2>
          {community.length > 0 && (
            <span className="bg-[#ede7f6] dark:bg-purple-900/30 text-[#4527a0] dark:text-purple-300 text-xs font-bold px-3 py-1 rounded-full">
              {community.length} preguntas
            </span>
          )}
        </div>
        {community.length > 0 ? (
          <div className="space-y-4">
            {community.map((q) => (
              <CommunityCard key={q.id} question={q} userId={userId} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-[#f1efff] dark:bg-white/5 rounded-[1.5rem]">
            <span className="material-symbols-outlined text-[#a6aad7] text-5xl mb-3 block">chat_bubble_outline</span>
            <p className="text-[#545881] dark:text-[#969ac6] font-medium">Sé el primero en preguntar arriba ↑</p>
          </div>
        )}
      </section>

      {/* Top Reputation Leaderboard */}
      {topUsers.length > 0 && (
        <section className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-[#272b51] dark:text-[#c8ccf0]"
                style={{ fontFamily: "var(--font-plus-jakarta)" }}>
                Top Reputación
              </h2>
              <p className="text-sm text-[#545881] dark:text-[#969ac6] mt-0.5">Los más valorados por la comunidad</p>
            </div>
            <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-bold px-3 py-1 rounded-full">
              👑 Leaderboard
            </span>
          </div>

          <div className="space-y-3">
            {topUsers.map((u, i) => {
              const tier = getTier(u.reputation);
              return (
                <Link key={u.id} href={`/u/${u.username}`}
                  className="flex items-center gap-4 bg-white dark:bg-[#111328] rounded-[1.5rem] px-5 py-4 shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:scale-[1.01] transition-all group">
                  {/* Rank */}
                  <span className={`text-2xl font-black w-7 flex-shrink-0 ${i === 0 ? "text-amber-500" : i === 1 ? "text-[#545881]" : i === 2 ? "text-[#a33800]" : "text-[#a6aad7]"}`}
                    style={{ fontFamily: "var(--font-plus-jakarta)" }}>
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                  </span>

                  {/* Avatar */}
                  {u.avatar_url ? (
                    <img src={u.avatar_url} alt={u.username} className="w-11 h-11 rounded-full object-cover flex-shrink-0 ring-2 ring-[#f1efff] dark:ring-white/10" />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#0052d0] to-[#8d3a8b] flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-white text-base" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-[#272b51] dark:text-[#c8ccf0] truncate"
                        style={{ fontFamily: "var(--font-plus-jakarta)" }}>
                        {u.display_name ?? u.username}
                      </span>
                      <UserBadges badge={u.badge} isVerified={u.is_verified} size="sm" />
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-[#a6aad7]">@{u.username}</span>
                      <span className="text-xs text-[#a6aad7]">·</span>
                      <span className="text-xs text-[#545881] dark:text-[#969ac6]">{u.answers} respuestas</span>
                    </div>
                  </div>

                  {/* Reputation */}
                  <div className="flex flex-col items-end flex-shrink-0">
                    <div className={`flex items-center gap-1 ${tier.color}`}>
                      <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>{tier.icon}</span>
                      <span className="text-sm font-extrabold">{u.reputation}</span>
                    </div>
                    <span className="text-xs text-[#a6aad7]">{tier.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Latest questions feed */}
      <section>
        <h2 className="text-3xl font-extrabold tracking-tight text-[#272b51] dark:text-[#c8ccf0] mb-8"
          style={{ fontFamily: "var(--font-plus-jakarta)" }}>
          Últimas preguntas
        </h2>
        {questions.length > 0 ? (
          <div className="space-y-4">
            {questions.map((q) => <QuestionCard key={q.id} question={q} userId={userId} />)}
          </div>
        ) : (
          <div className="text-center py-20 bg-[#f1efff] dark:bg-white/5 rounded-[1.5rem]">
            <span className="material-symbols-outlined text-[#a6aad7] text-6xl mb-4 block">chat_bubble_outline</span>
            <p className="text-[#272b51] dark:text-[#c8ccf0] font-bold text-lg">No hay preguntas aún</p>
            <p className="text-[#545881] dark:text-[#969ac6] text-sm mt-1">¡Sé el primero en preguntar!</p>
          </div>
        )}
      </section>
    </>
  );
}

/* ── Community Ask Box (inline form on home) ── */
function CommunityAskBox({ userId }: { userId: string | null }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const MAX = 500;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !userId) return;
    setStatus("loading");
    const supabase = createClient();
    const { error } = await supabase.from("questions").insert({
      recipient_id: null,
      sender_id: userId,
      content: text.trim(),
      is_anonymous: isAnonymous,
    });
    if (!error) {
      setText("");
      setStatus("done");
      router.refresh(); // refresca el feed para mostrar la nueva pregunta
      setTimeout(() => setStatus("idle"), 2500);
    } else {
      console.error(error);
      setStatus("idle");
    }
  }

  return (
    <div className="bg-[#f1efff] dark:bg-white/5 rounded-[1.5rem] p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0052d0] to-[#8d3a8b] flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-white text-xl">psychology</span>
        </div>
        <div>
          <h1 className="font-extrabold text-[#272b51] dark:text-[#c8ccf0] text-lg" style={{ fontFamily: "var(--font-plus-jakarta)" }}>
            ¿Qué tienes en mente?
          </h1>
          <p className="text-xs text-[#545881] dark:text-[#969ac6]">Pregunta a la comunidad — cualquiera puede responder</p>
        </div>
      </div>

      {userId ? (
        status === "done" ? (
          <div className="flex items-center gap-3 bg-white dark:bg-white/10 rounded-[1rem] px-5 py-4">
            <span className="material-symbols-outlined text-[#0052d0] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            <div>
              <p className="font-bold text-[#272b51] dark:text-[#c8ccf0] text-sm">¡Pregunta publicada!</p>
              <p className="text-xs text-[#545881] dark:text-[#969ac6]">Aparece en el feed abajo 👇</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Anonymous toggle */}
            <div className="flex bg-white dark:bg-white/10 rounded-[1rem] p-1">
              <button type="button" onClick={() => setIsAnonymous(true)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-[0.75rem] text-sm font-bold transition-all ${isAnonymous ? "bg-[#f1efff] dark:bg-[#0052d0] text-[#0052d0] dark:text-white shadow-sm" : "text-[#545881] dark:text-[#969ac6]"}`}>
                <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: isAnonymous ? "'FILL' 1" : "'FILL' 0" }}>visibility_off</span>
                Anónimo
              </button>
              <button type="button" onClick={() => setIsAnonymous(false)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-[0.75rem] text-sm font-bold transition-all ${!isAnonymous ? "bg-[#f1efff] dark:bg-[#0052d0] text-[#0052d0] dark:text-white shadow-sm" : "text-[#545881] dark:text-[#969ac6]"}`}>
                <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: !isAnonymous ? "'FILL' 1" : "'FILL' 0" }}>person</span>
                Con mi perfil
              </button>
            </div>

            <div className="relative">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={MAX}
                rows={3}
                placeholder={isAnonymous ? "Lanza tu pregunta anónima..." : "Lanza tu pregunta..."}
                className="w-full bg-white dark:bg-white/10 dark:text-[#c8ccf0] rounded-[1rem] py-4 px-5 text-[#272b51] placeholder:text-[#a6aad7] focus:outline-none focus:ring-2 focus:ring-[#0052d0]/30 resize-none transition"
              />
              <span className={`absolute bottom-3 right-4 text-xs font-medium ${text.length >= MAX * 0.9 ? "text-[#b31b25]" : "text-[#a6aad7]"}`}>
                {text.length}/{MAX}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-[#a6aad7]">
                {isAnonymous ? "Nadie sabrá que eres tú" : "Tu perfil será visible"}
              </span>
              <button
                type="submit"
                disabled={!text.trim() || status === "loading"}
                className="flex items-center gap-2 bg-gradient-to-br from-[#0052d0] to-[#799dff] text-white font-bold py-3 px-6 rounded-full shadow-[0_8px_24px_rgba(0,82,208,0.2)] active:scale-95 transition-all disabled:opacity-50"
              >
                {status === "loading"
                  ? <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                  : <span className="material-symbols-outlined text-lg">send</span>}
                Publicar
              </button>
            </div>
          </form>
        )
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <p className="text-[#545881] dark:text-[#969ac6] text-sm flex-1">
            Únete para lanzar preguntas a la comunidad y obtener respuestas.
          </p>
          <div className="flex gap-2">
            <Link href="/login" className="font-bold text-sm text-[#0052d0] dark:text-[#5e8bff] px-4 py-2 rounded-full hover:bg-white/50 transition-colors">
              Iniciar sesión
            </Link>
            <Link href="/register" className="bg-gradient-to-br from-[#0052d0] to-[#799dff] text-white font-bold text-sm py-2 px-5 rounded-full shadow-[0_4px_12px_rgba(0,82,208,0.2)] active:scale-95 transition-all">
              Registrarse
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Community card (anyone can reply, question stays open) ── */
function CommunityCard({ question, userId }: { question: FeedQuestion; userId: string | null }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [answer, setAnswer] = useState("");
  const [replied, setReplied] = useState(false);
  const [loading, setLoading] = useState(false);

  const timeAgo = formatTimeAgo(question.created_at);
  const senderName = question.is_anonymous
    ? "Anónimo"
    : (question.sender?.display_name ?? question.sender?.username ?? "Usuario");

  async function handleAnswer(e: React.FormEvent) {
    e.preventDefault();
    if (!answer.trim() || !userId) return;
    setLoading(true);
    const supabase = createClient();

    // Insert a new answered question on the responder's profile
    // Original community question stays open for others to also respond
    const { error } = await supabase.from("questions").insert({
      recipient_id: userId,
      sender_id: question.sender_id,
      content: question.content,
      is_anonymous: question.is_anonymous,
      answer: answer.trim(),
      answered_at: new Date().toISOString(),
    });

    if (!error) {
      setReplied(true);
      setExpanded(false);
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <div className="bg-white dark:bg-[#111328] rounded-[1.5rem] overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
      <div className="p-5">
        {/* Sender */}
        <div className="flex items-start gap-3">
          {question.is_anonymous ? (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#a33800] to-[#ffc4af] flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
            </div>
          ) : question.sender?.avatar_url ? (
            <img src={question.sender.avatar_url} className="w-9 h-9 rounded-full object-cover flex-shrink-0 mt-0.5" alt={senderName} />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0052d0] to-[#8d3a8b] flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-xs font-bold text-[#545881] dark:text-[#969ac6] uppercase tracking-widest">
                {senderName}
              </p>
              {!question.is_anonymous && question.sender && (
                <UserBadges badge={question.sender.badge ?? null} isVerified={question.sender.is_verified ?? false} size="sm" />
              )}
              <span className="text-xs text-[#a6aad7]">· {timeAgo}</span>
            </div>
            <p className="text-[#272b51] dark:text-[#c8ccf0] font-medium leading-relaxed">
              {question.content}
            </p>
          </div>
        </div>

        {/* Success state */}
        {replied && (
          <div className="mt-4 flex items-center gap-2 bg-[#f1efff] dark:bg-white/10 rounded-[1rem] px-4 py-3">
            <span className="material-symbols-outlined text-[#0052d0] text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            <p className="text-sm font-semibold text-[#272b51] dark:text-[#c8ccf0]">¡Respuesta publicada en tu perfil!</p>
          </div>
        )}

        {/* Respond button */}
        {userId && !expanded && !replied && (
          <button onClick={() => setExpanded(true)}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-[#f1efff] dark:bg-white/10 hover:bg-[#e6e6ff] dark:hover:bg-white/20 text-[#0052d0] dark:text-[#5e8bff] font-bold py-3 rounded-[1rem] transition-colors text-sm">
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
            placeholder="Tu respuesta se publicará en tu perfil..."
            className="w-full bg-[#f8f5ff] dark:bg-white/10 dark:text-[#c8ccf0] rounded-[1rem] py-3 px-4 text-[#272b51] placeholder:text-[#a6aad7] focus:outline-none focus:ring-2 focus:ring-[#0052d0]/30 resize-none transition text-sm"
          />
          <div className="flex gap-2">
            <button type="button" onClick={() => setExpanded(false)}
              className="flex-1 py-3 rounded-full bg-[#f1efff] dark:bg-white/10 text-[#545881] dark:text-[#969ac6] font-bold text-sm">
              Cancelar
            </button>
            <button type="submit" disabled={!answer.trim() || loading}
              className="flex-1 py-3 rounded-full bg-gradient-to-br from-[#0052d0] to-[#799dff] text-white font-bold text-sm shadow-[0_4px_12px_rgba(0,82,208,0.2)] disabled:opacity-50 active:scale-95 transition-all flex items-center justify-center gap-2">
              {loading
                ? <><span className="material-symbols-outlined animate-spin text-base">progress_activity</span>Publicando...</>
                : <><span className="material-symbols-outlined text-base">send</span>Publicar</>}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

/* ── Trending Ask Done — #1 featured card ── */
function TrendingFeatured({ question, userId }: { question: FeedQuestion; userId: string | null }) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(question.likes_count);

  async function toggleLike(e: React.MouseEvent) {
    e.preventDefault();
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
    <div className="relative rounded-[2rem] overflow-hidden group">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0052d0] via-[#4527a0] to-[#8d3a8b] opacity-90" />
      {/* Animated blobs */}
      <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-3xl group-hover:scale-110 transition-transform duration-700" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-[#f797f0]/20 blur-2xl group-hover:scale-125 transition-transform duration-700" />

      <div className="relative z-10 p-8">
        {/* #1 badge */}
        <div className="flex items-center justify-between mb-6">
          <span className="flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
            #1 Trending
          </span>
          <span className="text-white/60 text-xs font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
            {count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count} likes
          </span>
        </div>

        {/* Quote */}
        <span className="material-symbols-outlined text-white/20 text-7xl absolute top-6 right-6 rotate-12 group-hover:rotate-0 transition-transform duration-700">format_quote</span>
        <h3 className="text-2xl font-extrabold text-white leading-tight mb-4 pr-16"
          style={{ fontFamily: "var(--font-plus-jakarta)" }}>
          &ldquo;{question.content}&rdquo;
        </h3>

        {question.answer && (
          <p className="text-white/70 text-sm leading-relaxed mb-6 line-clamp-2">{question.answer}</p>
        )}

        {/* User + actions */}
        <div className="flex items-center justify-between">
          {question.profiles ? (
            <Link href={`/u/${question.profiles.username}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <ProfileAvatar profile={question.profiles} size="sm" />
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="font-bold text-white text-sm">{question.profiles.display_name ?? question.profiles.username}</p>
                  <UserBadges badge={question.profiles.badge ?? null} isVerified={question.profiles.is_verified ?? false} size="sm" />
                </div>
                <p className="text-white/60 text-xs">@{question.profiles.username}</p>
              </div>
            </Link>
          ) : <div />}

          <button onClick={toggleLike}
            className={`flex items-center gap-2 font-bold px-4 py-2 rounded-full backdrop-blur-sm transition-all active:scale-95 ${
              liked ? "bg-[#b31b25] text-white" : "bg-white/20 text-white hover:bg-white/30"
            }`}>
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: liked ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
            {count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Trending Ask Done — grid cards (#2–#6) ── */
const CARD_GRADIENTS = [
  "from-[#0052d0]/10 to-[#799dff]/20 dark:from-[#0052d0]/30 dark:to-[#799dff]/10",
  "from-[#8d3a8b]/10 to-[#f797f0]/20 dark:from-[#8d3a8b]/30 dark:to-[#f797f0]/10",
  "from-[#a33800]/10 to-[#ffc4af]/20 dark:from-[#a33800]/30 dark:to-[#ffc4af]/10",
  "from-[#4527a0]/10 to-[#d8daff]/20 dark:from-[#4527a0]/30 dark:to-[#d8daff]/10",
  "from-[#006633]/10 to-[#a8f0c6]/20 dark:from-[#006633]/30 dark:to-[#a8f0c6]/10",
];

function TrendingCard({ question, userId, rank }: { question: FeedQuestion; userId: string | null; rank: number }) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(question.likes_count);
  const gradient = CARD_GRADIENTS[(rank - 2) % CARD_GRADIENTS.length];

  async function toggleLike(e: React.MouseEvent) {
    e.preventDefault();
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
    <div className={`relative rounded-[1.5rem] bg-gradient-to-br ${gradient} border border-white/50 dark:border-white/5 p-5 group hover:scale-[1.02] transition-all duration-300 overflow-hidden`}>
      {/* Rank badge */}
      <span className="absolute top-4 right-4 text-xs font-black text-[#545881] dark:text-[#969ac6] opacity-40 text-2xl"
        style={{ fontFamily: "var(--font-plus-jakarta)" }}>#{rank}</span>

      <p className="text-[#272b51] dark:text-[#c8ccf0] font-semibold text-sm leading-relaxed mb-4 line-clamp-3 pr-8">
        &ldquo;{question.content}&rdquo;
      </p>

      {question.answer && (
        <p className="text-[#545881] dark:text-[#969ac6] text-xs leading-relaxed mb-4 line-clamp-2">
          {question.answer}
        </p>
      )}

      <div className="flex items-center justify-between">
        {question.profiles ? (
          <Link href={`/u/${question.profiles.username}`} className="flex items-center gap-2 hover:opacity-70 transition-opacity" onClick={(e) => e.stopPropagation()}>
            <ProfileAvatar profile={question.profiles} size="sm" />
            <div>
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-[#272b51] dark:text-[#c8ccf0]">
                  {question.profiles.display_name ?? question.profiles.username}
                </span>
                <UserBadges badge={question.profiles.badge ?? null} isVerified={question.profiles.is_verified ?? false} size="sm" />
              </div>
            </div>
          </Link>
        ) : <div />}

        <button onClick={toggleLike}
          className={`flex items-center gap-1 text-xs font-bold transition-colors ${liked ? "text-[#b31b25]" : "text-[#545881] dark:text-[#969ac6] hover:text-[#b31b25]"}`}>
          <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: liked ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
          {count}
        </button>
      </div>
    </div>
  );
}

/* ── Latest unanswered question card ── */
function QuestionCard({ question, userId }: { question: FeedQuestion; userId: string | null }) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(question.likes_count);
  const timeAgo = formatTimeAgo(question.created_at);

  async function toggleLike(e: React.MouseEvent) {
    e.preventDefault();
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
    <article className="bg-white dark:bg-[#111328] rounded-[1.5rem] p-5 shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-shadow">
      <Link href={question.profiles ? `/u/${question.profiles.username}` : "#"} className="block">
        <div className="flex items-start gap-4">
          {/* Anonymous avatar */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#a33800] to-[#ffc4af] flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-white text-sm"
              style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[#272b51] dark:text-[#c8ccf0] font-medium leading-relaxed mb-3">
              {question.content}
            </p>

            {question.profiles && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#a6aad7]">para</span>
                <ProfileAvatar profile={question.profiles} size="sm" />
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-[#272b51] dark:text-[#c8ccf0]">
                      {question.profiles.display_name ?? question.profiles.username}
                    </span>
                    <UserBadges badge={question.profiles.badge ?? null} isVerified={question.profiles.is_verified ?? false} size="sm" />
                  </div>
                  <span className="text-xs text-[#a6aad7]">@{question.profiles.username} · {timeAgo}</span>
                </div>
              </div>
            )}
          </div>

          <span className="material-symbols-outlined text-[#a6aad7] flex-shrink-0 mt-1">arrow_forward</span>
        </div>
      </Link>

      {/* Like button */}
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#f1efff] dark:border-white/5">
        <button
          onClick={toggleLike}
          className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${
            liked ? "text-[#b31b25]" : "text-[#a6aad7] hover:text-[#b31b25]"
          } ${!userId ? "opacity-40 cursor-default" : ""}`}
        >
          <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: liked ? "'FILL' 1" : "'FILL' 0" }}>
            favorite
          </span>
          {count > 0 && <span>{count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count}</span>}
        </button>
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
