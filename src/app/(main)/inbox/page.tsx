import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";
import InboxList from "./InboxList";

export const metadata = { title: "Inbox — Luminous" };

export default async function InboxPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: questions } = await supabase
    .from("questions")
    .select("*")
    .eq("recipient_id", user.id)
    .is("answer", null)
    .order("created_at", { ascending: false });

  return (
    <>
      <TopBar />
      <main className="max-w-2xl mx-auto px-4 pt-24 pb-28 md:pb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className="text-3xl font-extrabold text-[#272b51] tracking-tight"
              style={{ fontFamily: "var(--font-plus-jakarta)" }}
            >
              Inbox
            </h1>
            <p className="text-[#545881] text-sm mt-1">
              {questions?.length ?? 0} unanswered{" "}
              {(questions?.length ?? 0) === 1 ? "question" : "questions"}
            </p>
          </div>
          {(questions?.length ?? 0) > 0 && (
            <span className="bg-gradient-to-br from-[#0052d0] to-[#799dff] text-white text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,82,208,0.3)]">
              {questions!.length > 99 ? "99+" : questions!.length}
            </span>
          )}
        </div>

        {questions && questions.length > 0 ? (
          <InboxList questions={questions} />
        ) : (
          <div className="text-center py-20 bg-[#f1efff] rounded-[1.5rem]">
            <span className="material-symbols-outlined text-[#a6aad7] text-6xl mb-4 block">
              mark_email_read
            </span>
            <p className="text-[#272b51] font-bold text-lg">All caught up!</p>
            <p className="text-[#545881] text-sm mt-1">
              No unanswered questions.
            </p>
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}
