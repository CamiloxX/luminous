import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";

export const metadata = { title: "Discover — Luminous" };

type TopProfile = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  questions: { count: number }[];
};

type TopQuestion = {
  id: string;
  content: string;
  answer: string | null;
  likes_count: number;
  profiles: { username: string; display_name: string | null; avatar_url: string | null } | null;
};

export default async function DiscoverPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  // Top users by answered questions count
  const { data: topProfiles } = await supabase
    .from("profiles")
    .select(`
      id,
      username,
      display_name,
      avatar_url,
      questions:questions!recipient_id(count)
    `)
    .limit(12) as unknown as { data: TopProfile[] | null };

  // Most liked questions of all time
  const { data: topQuestions } = await supabase
    .from("questions")
    .select(`
      id, content, answer, likes_count,
      profiles:recipient_id (username, display_name, avatar_url)
    `)
    .not("answer", "is", null)
    .order("likes_count", { ascending: false })
    .limit(10) as unknown as { data: TopQuestion[] | null };

  return (
    <>
      <TopBar userId={user?.id ?? null} />
      <main className="max-w-4xl mx-auto px-4 pt-24 pb-28 md:pb-12">
        {/* People to follow */}
        <section className="mb-14">
          <h2
            className="text-3xl font-extrabold tracking-tight text-[#272b51] mb-8"
            style={{ fontFamily: "var(--font-plus-jakarta)" }}
          >
            People to Ask
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {(topProfiles ?? []).map((p) => {
              const answeredCount = Array.isArray(p.questions) ? p.questions.length : 0;
              return (
                <Link
                  key={p.id}
                  href={`/u/${p.username}`}
                  className="bg-white rounded-[1.5rem] p-5 flex flex-col items-center text-center shadow-[0_8px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:scale-[1.02] transition-all duration-200"
                >
                  {p.avatar_url ? (
                    <img
                      src={p.avatar_url}
                      alt={p.username}
                      className="w-14 h-14 rounded-full object-cover mb-3 ring-2 ring-[#f1efff]"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#0052d0] to-[#8d3a8b] flex items-center justify-center mb-3 shadow-md">
                      <span
                        className="material-symbols-outlined text-white text-2xl"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        person
                      </span>
                    </div>
                  )}
                  <p
                    className="font-bold text-[#272b51] text-sm truncate w-full"
                    style={{ fontFamily: "var(--font-plus-jakarta)" }}
                  >
                    {p.display_name ?? p.username}
                  </p>
                  <p className="text-xs text-[#545881] truncate w-full">@{p.username}</p>
                  <span className="mt-3 bg-[#f1efff] text-[#0052d0] text-xs font-bold px-3 py-1 rounded-full">
                    {answeredCount} answers
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Top questions */}
        <section>
          <h2
            className="text-3xl font-extrabold tracking-tight text-[#272b51] mb-8"
            style={{ fontFamily: "var(--font-plus-jakarta)" }}
          >
            Most Liked
          </h2>
          <div className="space-y-5">
            {(topQuestions ?? []).map((q, i) => {
              const profile = q.profiles as { username: string; display_name: string | null; avatar_url: string | null } | null;
              return (
                <Link
                  key={q.id}
                  href={profile ? `/u/${profile.username}` : "#"}
                  className="flex items-start gap-4 bg-white rounded-[1.5rem] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-shadow group"
                >
                  {/* Rank */}
                  <span
                    className={`text-2xl font-black w-8 flex-shrink-0 ${
                      i === 0 ? "text-[#a33800]" : i === 1 ? "text-[#545881]" : "text-[#a6aad7]"
                    }`}
                    style={{ fontFamily: "var(--font-plus-jakarta)" }}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#545881] uppercase tracking-widest mb-1">
                      Anonymous asked {profile ? `@${profile.username}` : ""}
                    </p>
                    <p className="text-[#272b51] font-medium leading-relaxed line-clamp-2 mb-3">
                      {q.content}
                    </p>
                    {q.answer && (
                      <p className="text-[#545881] text-sm line-clamp-1">{q.answer}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <span className="material-symbols-outlined text-[#b31b25]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                    <span className="text-xs font-bold text-[#545881]">
                      {q.likes_count >= 1000 ? `${(q.likes_count / 1000).toFixed(1)}k` : q.likes_count}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
      <BottomNav />
    </>
  );
}
