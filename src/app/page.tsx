import { createClient } from "@/lib/supabase/server";
import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";
import HomeFeed from "./HomeFeed";
import AskModal from "@/components/ui/AskModal";

export type FeedQuestion = {
  id: string;
  content: string;
  answer: string | null;
  answered_at: string | null;
  likes_count: number;
  is_anonymous: boolean;
  created_at: string;
  recipient_id: string | null;
  profiles: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    is_verified: boolean;
    badge: string | null;
  } | null;
};

export type TopUser = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  badge: string | null;
  totalLikes: number;
  answers: number;
  reputation: number;
};

export const dynamic = "force-dynamic";
export const metadata = { title: "Home — Luminous" };

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Latest unanswered questions directed at users
  const { data: questions } = await supabase
    .from("questions")
    .select(`id, content, answer, answered_at, likes_count, is_anonymous, created_at, recipient_id, profiles:recipient_id (username, display_name, avatar_url, is_verified, badge)`)
    .is("answer", null)
    .not("recipient_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(20) as unknown as { data: FeedQuestion[] | null };

  // Unanswered community questions
  const { data: community } = await supabase
    .from("questions")
    .select(`id, content, answer, answered_at, likes_count, is_anonymous, created_at, recipient_id`)
    .is("recipient_id", null)
    .is("answer", null)
    .order("created_at", { ascending: false })
    .limit(10) as unknown as { data: FeedQuestion[] | null };

  // Trending Ask Done: most liked answered questions
  const { data: trending } = await supabase
    .from("questions")
    .select(`id, content, answer, answered_at, likes_count, is_anonymous, created_at, recipient_id, profiles:recipient_id (username, display_name, avatar_url, is_verified, badge)`)
    .not("answer", "is", null)
    .order("likes_count", { ascending: false })
    .limit(6) as unknown as { data: FeedQuestion[] | null };

  // Top users by reputation (aggregate from answered questions)
  const { data: repQuestions } = await supabase
    .from("questions")
    .select(`recipient_id, likes_count, profiles:recipient_id(id, username, display_name, avatar_url, is_verified, badge)`)
    .not("answer", "is", null)
    .not("recipient_id", "is", null)
    .limit(100) as unknown as { data: { recipient_id: string; likes_count: number; profiles: TopUser | null }[] | null };

  const userMap = new Map<string, TopUser>();
  for (const q of repQuestions ?? []) {
    if (!q.recipient_id || !q.profiles) continue;
    const p = q.profiles as unknown as { id: string; username: string; display_name: string | null; avatar_url: string | null; is_verified: boolean; badge: string | null };
    const existing = userMap.get(q.recipient_id);
    if (existing) {
      existing.totalLikes += q.likes_count;
      existing.answers += 1;
      existing.reputation = existing.totalLikes * 5 + existing.answers * 10;
    } else {
      userMap.set(q.recipient_id, {
        id: p.id, username: p.username, display_name: p.display_name,
        avatar_url: p.avatar_url, is_verified: p.is_verified, badge: p.badge,
        totalLikes: q.likes_count, answers: 1,
        reputation: q.likes_count * 5 + 10,
      });
    }
  }
  const topUsers: TopUser[] = [...userMap.values()]
    .sort((a, b) => b.reputation - a.reputation)
    .slice(0, 5);

  return (
    <>
      <TopBar userId={user?.id ?? null} />
      <main className="max-w-4xl mx-auto px-4 pt-24 pb-28 md:pb-12">
        <HomeFeed
          questions={questions ?? []}
          community={community ?? []}
          trending={trending ?? []}
          topUsers={topUsers}
          userId={user?.id ?? null}
        />
      </main>
      <BottomNav />
      {user && <AskModal userId={user.id} />}
    </>
  );
}
