"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AskModal({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const MAX = 500;

  useEffect(() => {
    function handleOpen() { setOpen(true); }
    const btn = document.getElementById("open-ask-modal");
    btn?.addEventListener("click", handleOpen);
    return () => btn?.removeEventListener("click", handleOpen);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") handleClose(); }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;
    setStatus("loading");

    const supabase = createClient();
    await supabase.from("questions").insert({
      recipient_id: null,       // community question — no specific person
      sender_id: userId,
      content: question.trim(),
      is_anonymous: true,
    });

    setStatus("success");
    setTimeout(() => handleClose(), 1800);
  }

  function handleClose() {
    setOpen(false);
    setQuestion("");
    setStatus("idle");
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative w-full max-w-lg bg-white dark:bg-[#111328] rounded-[1.5rem] p-6 shadow-[0_24px_64px_rgba(0,0,0,0.2)]">
        {status === "success" ? (
          <div className="text-center py-8">
            <span
              className="material-symbols-outlined text-[#0052d0] text-6xl mb-3 block"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
            <p className="font-extrabold text-[#272b51] dark:text-[#c8ccf0] text-xl"
              style={{ fontFamily: "var(--font-plus-jakarta)" }}>
              ¡Pregunta enviada!
            </p>
            <p className="text-[#545881] dark:text-[#969ac6] text-sm mt-1">
              La comunidad podrá responderla.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-extrabold text-[#272b51] dark:text-[#c8ccf0]"
                  style={{ fontFamily: "var(--font-plus-jakarta)" }}>
                  Pregunta anónima
                </h2>
                <p className="text-xs text-[#545881] dark:text-[#969ac6] mt-0.5">
                  La comunidad verá tu pregunta y podrá responder
                </p>
              </div>
              <button onClick={handleClose}
                className="text-[#a6aad7] hover:text-[#272b51] dark:hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-start gap-3">
                {/* Anonymous avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#a33800] to-[#ffc4af] flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="material-symbols-outlined text-white text-lg"
                    style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                </div>
                <div className="relative flex-1">
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    maxLength={MAX}
                    rows={4}
                    autoFocus
                    placeholder="¿Qué le preguntarías a la comunidad?"
                    className="w-full bg-[#f1efff] dark:bg-white/10 dark:text-[#c8ccf0] rounded-[1rem] py-3 px-4 text-[#272b51] placeholder:text-[#a6aad7] focus:outline-none focus:ring-2 focus:ring-[#0052d0]/30 resize-none transition"
                  />
                  <span className={`absolute bottom-3 right-4 text-xs font-medium ${
                    question.length >= MAX * 0.9 ? "text-[#b31b25]" : "text-[#a6aad7]"
                  }`}>
                    {question.length}/{MAX}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={!question.trim() || status === "loading"}
                className="w-full bg-gradient-to-br from-[#0052d0] to-[#799dff] text-white font-bold py-4 rounded-full shadow-[0_12px_32px_rgba(0,82,208,0.2)] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {status === "loading" ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                    Enviando...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">send</span>
                    Preguntar a la comunidad
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
