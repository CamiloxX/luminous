"use client";

import { useState } from "react";

interface Props {
  username: string;
  questionId: string;
  questionContent: string;
}

export default function ShareButton({ username, questionId, questionContent }: Props) {
  const [status, setStatus] = useState<"idle" | "copied" | "shared">("idle");

  const url = `${typeof window !== "undefined" ? window.location.origin : ""}/u/${username}#${questionId}`;
  const text = `"${questionContent.slice(0, 80)}${questionContent.length > 80 ? "…" : ""}" — answered on Luminous`;

  async function handleShare() {
    // Try native Web Share API first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({ title: "Luminous", text, url });
        setStatus("shared");
        setTimeout(() => setStatus("idle"), 2000);
        return;
      } catch {
        // User cancelled — do nothing
        return;
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setStatus("copied");
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      // Last resort: old execCommand
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setStatus("copied");
      setTimeout(() => setStatus("idle"), 2000);
    }
  }

  return (
    <button
      onClick={handleShare}
      className={`flex items-center gap-2 transition-colors ${
        status !== "idle"
          ? "text-[#0052d0]"
          : "text-[#545881] hover:text-[#0052d0]"
      }`}
    >
      <span className="material-symbols-outlined text-xl">
        {status === "copied" ? "check_circle" : status === "shared" ? "check_circle" : "share"}
      </span>
      <span className="text-sm font-semibold">
        {status === "copied" ? "Copied!" : status === "shared" ? "Shared!" : "Share"}
      </span>
    </button>
  );
}
