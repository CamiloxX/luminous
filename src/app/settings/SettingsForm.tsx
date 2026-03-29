"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BADGES, type BadgeId } from "@/components/ui/UserBadges";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export default function SettingsForm({ profile, userId }: { profile: Profile; userId: string }) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [selectedBadge, setSelectedBadge] = useState<BadgeId | null>((profile.badge as BadgeId) ?? null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const fileRef = useRef<HTMLInputElement>(null);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    const supabase = createClient();

    let avatar_url = profile.avatar_url;

    // Upload avatar if changed
    if (avatarFile) {
      const ext = avatarFile.name.split(".").pop();
      const path = `${userId}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, avatarFile, { upsert: true });

      if (!uploadError) {
        const { data } = supabase.storage.from("avatars").getPublicUrl(path);
        avatar_url = `${data.publicUrl}?t=${Date.now()}`;
      }
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim() || null,
        bio: bio.trim() || null,
        badge: selectedBadge,
        avatar_url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      console.error("Profile update error:", error);
      setStatus("error");
      return;
    }

    setStatus("saved");
    router.refresh();
    setTimeout(() => setStatus("idle"), 2500);
  }

  const badgeEntries = Object.entries(BADGES) as [BadgeId, (typeof BADGES)[BadgeId]][];

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {/* Avatar */}
      <section className="bg-white dark:bg-[#111328] rounded-[1.5rem] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
        <h2 className="font-extrabold text-[#272b51] dark:text-[#c8ccf0] mb-5"
          style={{ fontFamily: "var(--font-plus-jakarta)" }}>
          Profile Photo
        </h2>
        <div className="flex items-center gap-5">
          <div className="relative">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar"
                className="w-20 h-20 rounded-full object-cover ring-4 ring-[#f1efff] dark:ring-white/10"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0052d0] to-[#8d3a8b] flex items-center justify-center ring-4 ring-[#f1efff] dark:ring-white/10">
                <span className="material-symbols-outlined text-white text-3xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
              </div>
            )}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#0052d0] text-white rounded-full flex items-center justify-center shadow-md hover:bg-[#0047b7] transition-colors"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
            </button>
          </div>
          <div>
            <p className="font-semibold text-[#272b51] dark:text-[#c8ccf0] text-sm">@{profile.username}</p>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="text-xs text-[#0052d0] dark:text-[#5e8bff] font-bold mt-1 hover:opacity-80 transition-opacity"
            >
              Change photo
            </button>
            <p className="text-xs text-[#a6aad7] mt-0.5">JPG, PNG or GIF · max 2MB</p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
      </section>

      {/* Info */}
      <section className="bg-white dark:bg-[#111328] rounded-[1.5rem] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.04)] space-y-5">
        <h2 className="font-extrabold text-[#272b51] dark:text-[#c8ccf0]"
          style={{ fontFamily: "var(--font-plus-jakarta)" }}>
          Profile Info
        </h2>

        <div>
          <label className="block text-sm font-semibold text-[#272b51] dark:text-[#c8ccf0] mb-2">
            Display Name
          </label>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={50}
            placeholder={profile.username}
            className="w-full bg-[#f1efff] dark:bg-white/10 dark:text-[#c8ccf0] rounded-full py-3 px-5 text-[#272b51] placeholder:text-[#a6aad7] focus:outline-none focus:ring-2 focus:ring-[#0052d0]/30 transition"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#272b51] dark:text-[#c8ccf0] mb-2">
            Bio
          </label>
          <div className="relative">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={160}
              rows={3}
              placeholder="Tell the world who you are..."
              className="w-full bg-[#f1efff] dark:bg-white/10 dark:text-[#c8ccf0] rounded-[1rem] py-3 px-5 text-[#272b51] placeholder:text-[#a6aad7] focus:outline-none focus:ring-2 focus:ring-[#0052d0]/30 resize-none transition"
            />
            <span className={`absolute bottom-3 right-4 text-xs font-medium ${bio.length >= 140 ? "text-[#b31b25]" : "text-[#a6aad7]"}`}>
              {bio.length}/160
            </span>
          </div>
        </div>
      </section>

      {/* Badge selector */}
      <section className="bg-white dark:bg-[#111328] rounded-[1.5rem] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-extrabold text-[#272b51] dark:text-[#c8ccf0]"
            style={{ fontFamily: "var(--font-plus-jakarta)" }}>
            Role Badge
          </h2>
          {selectedBadge && (
            <button
              type="button"
              onClick={() => setSelectedBadge(null)}
              className="text-xs text-[#545881] dark:text-[#969ac6] hover:text-[#b31b25] transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">close</span>
              Remove
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {badgeEntries.map(([id, b]) => {
            const isActive = selectedBadge === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedBadge(isActive ? null : id)}
                className={`flex items-center gap-2 px-3 py-3 rounded-[1rem] ring-2 transition-all text-left ${
                  isActive
                    ? `${b.bg} ${b.text} ${b.border} ring-2 scale-[1.02] shadow-md`
                    : "bg-[#f8f5ff] dark:bg-white/5 text-[#545881] dark:text-[#969ac6] ring-transparent hover:ring-[#a6aad7]/50"
                }`}
              >
                <span
                  className="material-symbols-outlined text-xl flex-shrink-0"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {b.icon}
                </span>
                <span className="text-xs font-semibold leading-tight">{b.label}</span>
                {isActive && (
                  <span className="material-symbols-outlined text-sm ml-auto"
                    style={{ fontVariationSettings: "'FILL' 1" }}>
                    check_circle
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Save button */}
      <button
        type="submit"
        disabled={status === "saving"}
        className="w-full bg-gradient-to-br from-[#0052d0] to-[#799dff] text-white font-bold py-4 rounded-full shadow-[0_12px_32px_rgba(0,82,208,0.2)] active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {status === "saving" && (
          <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
        )}
        {status === "saved" && (
          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        )}
        {status === "saving" ? "Saving..." : status === "saved" ? "Saved!" : "Save Changes"}
      </button>

      {status === "error" && (
        <p className="text-center text-sm text-[#b31b25]">
          Something went wrong. Try again.
        </p>
      )}
    </form>
  );
}
