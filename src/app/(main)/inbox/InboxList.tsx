"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type Question = Database["public"]["Tables"]["questions"]["Row"];

export default function InboxList({ questions }: { questions: Question[] }) {
  const [items, setItems] = useState(questions);

  function removeItem(id: string) {
    setItems((prev) => prev.filter((q) => q.id !== id));
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20 bg-[#f1efff] rounded-[1.5rem]">
        <span className="material-symbols-outlined text-[#a6aad7] text-6xl mb-4 block">
          mark_email_read
        </span>
        <p className="text-[#272b51] font-bold text-lg">All caught up!</p>
        <p className="text-[#545881] text-sm mt-1">No unanswered questions.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {items.map((q) => (
        <InboxItem key={q.id} question={q} onRemove={removeItem} />
      ))}
    </div>
  );
}

function InboxItem({
  question,
  onRemove,
}: {
  question: Question;
  onRemove: (id: string) => void;
}) {
  const router = useRouter();
  const [answer, setAnswer] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const MAX = 1000;

  async function handleAnswer(e: React.FormEvent) {
    e.preventDefault();
    if (!answer.trim()) return;
    setStatus("loading");

    const supabase = createClient();
    const { error } = await supabase
      .from("questions")
      .update({ answer: answer.trim(), answered_at: new Date().toISOString() })
      .eq("id", question.id);

    if (error) {
      setStatus("idle");
      return;
    }

    setStatus("done");
    setTimeout(() => {
      onRemove(question.id);
      router.refresh();
    }, 800);
  }

  async function handleDelete() {
    const supabase = createClient();
    await supabase.from("questions").delete().eq("id", question.id);
    onRemove(question.id);
  }

  const timeAgo = formatTimeAgo(question.created_at);

  return (
    <article
      className={`bg-white rounded-[1.5rem] overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition-all duration-300 ${
        status === "done" ? "opacity-0 scale-95" : "opacity-100"
      }`}
    >
      {/* Question header */}
      <div className="p-6">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#a33800] to-[#ffc4af] flex items-center justify-center flex-shrink-0 mt-0.5">
            <span
              className="material-symbols-outlined text-white text-sm"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              person
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-xs font-bold text-[#545881] uppercase tracking-widest">
                Anonymous · {timeAgo}
              </span>
              <button
                onClick={handleDelete}
                className="text-[#a6aad7] hover:text-[#b31b25] transition-colors flex-shrink-0"
                title="Delete question"
              >
                <span className="material-symbols-outlined text-lg">delete</span>
              </button>
            </div>
            <p className="text-[#272b51] font-medium leading-relaxed">
              {question.content}
            </p>
          </div>
        </div>

        {/* Toggle answer form */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-4 w-full flex items-center justify-center gap-2 bg-[#f1efff] hover:bg-[#e6e6ff] text-[#0052d0] font-bold py-3 rounded-[1rem] transition-colors text-sm"
        >
          <span className="material-symbols-outlined text-lg">
            {expanded ? "keyboard_arrow_up" : "reply"}
          </span>
          {expanded ? "Hide" : "Answer"}
        </button>
      </div>

      {/* Answer form */}
      {expanded && (
        <form
          onSubmit={handleAnswer}
          className="px-6 pb-6 pt-0 border-t border-[#f1efff]"
        >
          <div className="relative mt-4">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              maxLength={MAX}
              rows={4}
              autoFocus
              placeholder="Write your answer..."
              className="w-full bg-[#f8f5ff] rounded-[1rem] py-4 px-5 text-[#272b51] placeholder:text-[#a6aad7] focus:outline-none focus:ring-2 focus:ring-[#0052d0]/30 resize-none transition"
            />
            <span
              className={`absolute bottom-3 right-4 text-xs font-medium ${
                answer.length >= MAX * 0.9 ? "text-[#b31b25]" : "text-[#a6aad7]"
              }`}
            >
              {answer.length}/{MAX}
            </span>
          </div>

          <button
            type="submit"
            disabled={!answer.trim() || status === "loading"}
            className="mt-3 w-full bg-gradient-to-br from-[#0052d0] to-[#799dff] text-[#f1f2ff] font-bold py-3.5 rounded-full shadow-[0_8px_24px_rgba(0,82,208,0.2)] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {status === "loading" ? (
              <>
                <span className="material-symbols-outlined animate-spin text-lg">
                  progress_activity
                </span>
                Publishing...
              </>
            ) : status === "done" ? (
              <>
                <span className="material-symbols-outlined text-lg">check_circle</span>
                Published!
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">send</span>
                Publish Answer
              </>
            )}
          </button>
        </form>
      )}
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
