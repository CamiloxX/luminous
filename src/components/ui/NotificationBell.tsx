"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Notification {
  id: string;
  content: string;
  created_at: string;
  read: boolean;
}

export default function NotificationBell({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unread = notifications.filter((n) => !n.read).length;

  // Load recent unread questions on mount
  useEffect(() => {
    const supabase = createClient();

    supabase
      .from("questions")
      .select("id, content, created_at")
      .eq("recipient_id", userId)
      .is("answer", null)
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }) => {
        if (data) {
          setNotifications(data.map((q) => ({ ...q, read: false })));
        }
      });

    // Subscribe to new questions in real time
    const channel = supabase
      .channel(`inbox:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "questions",
          filter: `recipient_id=eq.${userId}`,
        },
        (payload) => {
          const newQ = payload.new as { id: string; content: string; created_at: string };
          setNotifications((prev) => [
            { id: newQ.id, content: newQ.content, created_at: newQ.created_at, read: false },
            ...prev.slice(0, 9),
          ]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function handleOpen() {
    setOpen((v) => !v);
    if (!open) markAllRead();
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        className="relative p-2 text-[#545881] hover:bg-[#f1efff] rounded-full transition-colors"
        aria-label="Notifications"
      >
        <span className="material-symbols-outlined text-2xl">notifications</span>
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-[#b31b25] text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none animate-pulse">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-[1.5rem] shadow-[0_24px_64px_rgba(0,0,0,0.15)] z-[200] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#f1efff]">
            <h3
              className="font-extrabold text-[#272b51] text-base"
              style={{ fontFamily: "var(--font-plus-jakarta)" }}
            >
              Notifications
            </h3>
            {notifications.length > 0 && (
              <Link
                href="/inbox"
                onClick={() => setOpen(false)}
                className="text-xs text-[#0052d0] font-bold hover:opacity-70 transition-opacity"
              >
                See all
              </Link>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-10 px-5">
                <span className="material-symbols-outlined text-[#a6aad7] text-4xl mb-2 block">
                  notifications_none
                </span>
                <p className="text-[#545881] text-sm">No notifications yet.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n.id}
                  href="/inbox"
                  onClick={() => setOpen(false)}
                  className={`flex items-start gap-3 px-5 py-4 hover:bg-[#f8f5ff] transition-colors border-b border-[#f8f5ff] last:border-0 ${
                    !n.read ? "bg-[#f1efff]" : ""
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#a33800] to-[#ffc4af] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span
                      className="material-symbols-outlined text-white text-sm"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      person
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#545881] mb-0.5">
                      Anonymous asked
                    </p>
                    <p className="text-sm text-[#272b51] line-clamp-2 leading-snug">
                      {n.content}
                    </p>
                    <p className="text-xs text-[#a6aad7] mt-1">
                      {formatTimeAgo(n.created_at)}
                    </p>
                  </div>
                  {!n.read && (
                    <div className="w-2 h-2 bg-[#0052d0] rounded-full flex-shrink-0 mt-2" />
                  )}
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
