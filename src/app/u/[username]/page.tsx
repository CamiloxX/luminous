import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AskForm from "./AskForm";
import AnsweredQuestions from "./AnsweredQuestions";
import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";
import UserBadges from "@/components/ui/UserBadges";

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

  return (
    <>
      <TopBar />
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

          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="bg-[#f797f0] text-[#610e63] text-xs font-bold px-3 py-1 rounded-full">
              {questions?.length ?? 0} answers
            </span>
            {isOwner && (
              <span className="bg-[#799dff] text-[#001e58] text-xs font-bold px-3 py-1 rounded-full">
                Your profile
              </span>
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
            <div className="text-center py-16 bg-[#f1efff] rounded-[1.5rem]">
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
