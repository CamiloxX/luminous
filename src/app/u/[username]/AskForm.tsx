"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  recipientId: string;
  username: string;
}

export default function AskForm({ recipientId, username }: Props) {
  const [question, setQuestion] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const MAX = 500;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;
    setStatus("loading");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("questions").insert({
      recipient_id: recipientId,
      sender_id: user?.id ?? null,
      content: question.trim(),
      is_anonymous: true,
    });

    if (error) {
      setStatus("error");
      return;
    }

    setQuestion("");
    setStatus("success");
    setTimeout(() => setStatus("idle"), 3000);
  }

  return (
    <div className="bg-[#f1efff] rounded-[1.5rem] p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#a33800] to-[#ffc4af] flex items-center justify-center">
          <span
            className="material-symbols-outlined text-white text-lg"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            person
          </span>
        </div>
        <div>
          <p className="text-sm font-bold text-[#272b51]">Ask anonymously</p>
          <p className="text-xs text-[#545881]">@{username} won&apos;t know it&apos;s you</p>
        </div>
      </div>

      {status === "success" ? (
        <div className="flex items-center gap-3 bg-white rounded-[1rem] px-5 py-4">
          <span className="material-symbols-outlined text-[#0052d0]">check_circle</span>
          <p className="text-[#272b51] font-medium text-sm">
            Question sent! @{username} will answer soon.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              maxLength={MAX}
              rows={3}
              placeholder={`Ask @${username} anything...`}
              className="w-full bg-white rounded-[1rem] py-4 px-5 text-[#272b51] placeholder:text-[#a6aad7] focus:outline-none focus:ring-2 focus:ring-[#0052d0]/30 resize-none transition"
            />
            <span
              className={`absolute bottom-3 right-4 text-xs font-medium ${
                question.length >= MAX * 0.9
                  ? "text-[#b31b25]"
                  : "text-[#a6aad7]"
              }`}
            >
              {question.length}/{MAX}
            </span>
          </div>

          {status === "error" && (
            <p className="text-sm text-[#b31b25]">
              Something went wrong. Try again.
            </p>
          )}

          <button
            type="submit"
            disabled={!question.trim() || status === "loading"}
            className="w-full bg-gradient-to-br from-[#0052d0] to-[#799dff] text-[#f1f2ff] font-bold py-3.5 rounded-full shadow-[0_8px_24px_rgba(0,82,208,0.2)] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === "loading" ? "Sending..." : "Send Question"}
          </button>
        </form>
      )}
    </div>
  );
}
