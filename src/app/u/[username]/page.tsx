import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AskForm from "./AskForm";
import AnsweredQuestions from "./AnsweredQuestions";
import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";
import UserBadges from "@/components/ui/UserBadges";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { username } = await params;
  return { title: `@${username} — Luminous` };
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username.toLowerCase())
    .maybeSingle();

  if (!profile) notFound();

  const { data: questions } = await supabase
    .from("questions")
    .select("*")
    .eq("recipient_id", profile.id)
    .not("answer", "is", null)
    .order("answered_at", { ascending: false });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isOwner = user?.id === profile.id;

  // Reputation: total likes received + answers given
  const totalLikes = questions?.reduce((sum, q) => sum + (q.likes_count ?? 0), 0) ?? 0;
  const answersCount = questions?.length ?? 0;
  const reputation = totalLikes * 5 + answersCount * 10;

  const reputationTier =
    reputation >= 1000 ? { label: "Leyenda", icon: "crown", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" } :
    reputation >= 500  ? { label: "Influyente", icon: "diamond", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" } :
    reputation >= 200  ? { label: "Popular", icon: "local_fire_department", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300" } :
    reputation >= 50   ? { label: "En ascenso", icon: "trending_up", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" } :
                         { label: "Nuevo", icon: "eco", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" };

  return (
    <>
      <TopBar userId={user?.id ?? null} />
      <main className="max-w-2xl mx-auto px-4 pt-24 pb-28 md:pb-12">
        {/* Profile Header */}
        <section className="mb-10 text-center">
          {/* Avatar */}
          <div className="flex justify-center mb-5">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name ?? profile.username}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-[#f8f5ff] shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#0052d0] to-[#8d3a8b] flex items-center justify-center shadow-lg ring-4 ring-[#f8f5ff]">
                <span className="material-symbols-outlined text-white text-4xl">
                  person
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 flex-wrap">
            <h1
              className="text-2xl font-extrabold text-[#272b51] dark:text-[#c8ccf0] tracking-tight"
              style={{ fontFamily: "var(--font-plus-jakarta)" }}
            >
              {profile.display_name ?? profile.username}
            </h1>
          </div>
          <p className="text-[#545881] dark:text-[#969ac6] text-sm mt-1">@{profile.username}</p>
          <div className="flex justify-center mt-2">
            <UserBadges badge={profile.badge} isVerified={profile.is_verified} size="md" />
          </div>

          {profile.bio && (
            <p className="text-[#272b51] mt-4 max-w-sm mx-auto leading-relaxed">
              {profile.bio}
            </p>
          )}

          <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
            <span className="bg-[#f797f0] text-[#610e63] text-xs font-bold px-3 py-1 rounded-full">
              {answersCount} respuestas
            </span>
            <span className={`flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full ${reputationTier.color}`}>
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                {reputationTier.icon}
              </span>
              {reputationTier.label} · {reputation} pts
            </span>
            {isOwner && (
              <Link href="/settings"
                className="flex items-center gap-1.5 bg-[#0052d0] text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-[#0047b7] transition-colors">
                <span className="material-symbols-outlined text-sm">edit</span>
                Editar perfil
              </Link>
            )}
          </div>
        </section>

        {/* Ask Form */}
        {!isOwner && (
          <AskForm recipientId={profile.id} username={profile.username} />
        )}

        {/* Answered Questions */}
        <section className="mt-10">
          <h2
            className="text-xl font-extrabold text-[#272b51] tracking-tight mb-6"
            style={{ fontFamily: "var(--font-plus-jakarta)" }}
          >
            {isOwner ? "Your Answers" : `${profile.display_name ?? profile.username}'s Answers`}
          </h2>

          {questions && questions.length > 0 ? (
            <AnsweredQuestions questions={questions} isOwner={isOwner} username={profile.username} />
          ) : (
            <div className="text-center py-16 bg-[#f1efff] dark:bg-white/5 rounded-[1.5rem]">
              <span className="material-symbols-outlined text-[#a6aad7] text-5xl mb-3 block">
                chat_bubble_outline
              </span>
              <p className="text-[#545881] font-medium">No answers yet.</p>
              {!isOwner && (
                <p className="text-sm text-[#a6aad7] mt-1">
                  Be the first to ask!
                </p>
              )}
            </div>
          )}
        </section>
      </main>
      <BottomNav />
    </>
  );
}
