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

export const metadata = { title: "Home — Luminous" };

export default async function HomePage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  // Answered questions (from profiles)
  const { data: questions } = await supabase
    .from("questions")
    .select(`id, content, answer, answered_at, likes_count, is_anonymous, created_at, recipient_id, profiles:recipient_id (username, display_name, avatar_url, is_verified, badge)`)
    .not("answer", "is", null)
    .not("recipient_id", "is", null)
    .order("answered_at", { ascending: false })
    .limit(20) as unknown as { data: FeedQuestion[] | null };

  // Unanswered community questions (no recipient) — open for anyone to answer
  const { data: community } = await supabase
    .from("questions")
    .select(`id, content, answer, answered_at, likes_count, is_anonymous, created_at, recipient_id`)
    .is("recipient_id", null)
    .is("answer", null)
    .order("created_at", { ascending: false })
    .limit(10) as unknown as { data: FeedQuestion[] | null };

  // Trending: most liked in last 7 days
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: trending } = await supabase
    .from("questions")
    .select(`id, content, answer, answered_at, likes_count, is_anonymous, created_at, recipient_id, profiles:recipient_id (username, display_name, avatar_url, is_verified, badge)`)
    .not("answer", "is", null)
    .gte("answered_at", since)
    .order("likes_count", { ascending: false })
    .limit(3) as unknown as { data: FeedQuestion[] | null };

  return (
    <>
      <TopBar userId={user?.id ?? null} />
      <main className="max-w-4xl mx-auto px-4 pt-24 pb-28 md:pb-12">
        <HomeFeed
          questions={questions ?? []}
          community={community ?? []}
          trending={trending ?? []}
          userId={user?.id ?? null}
        />
      </main>
      <BottomNav />
      {user && <AskModal userId={user.id} />}
    </>
  );
}
