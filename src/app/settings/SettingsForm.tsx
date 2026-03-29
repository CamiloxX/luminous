"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BADGES, parseBadges, type BadgeId } from "@/components/ui/UserBadges";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export default function SettingsForm({ profile, userId }: { profile: Profile; userId: string }) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [selectedBadges, setSelectedBadges] = useState<BadgeId[]>(parseBadges(profile.badge));
  const [isVerified, setIsVerified] = useState(profile.is_verified ?? false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(profile.cover_url ?? null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  function toggleBadge(id: BadgeId) {
    setSelectedBadges((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    const supabase = createClient();

    let avatar_url = profile.avatar_url;
    let cover_url = profile.cover_url ?? null;

    if (avatarFile) {
      const ext = avatarFile.name.split(".").pop();
      const path = `${userId}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, avatarFile, { upsert: true });

      if (uploadError) {
        setStatus("error");
        setErrorMsg(`Error al subir avatar: ${uploadError.message}`);
        return;
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      avatar_url = `${data.publicUrl}?t=${Date.now()}`;
    }

    if (coverFile) {
      const ext = coverFile.name.split(".").pop();
      const path = `${userId}/cover.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, coverFile, { upsert: true });

      if (uploadError) {
        setStatus("error");
        setErrorMsg(`Error al subir portada: ${uploadError.message}`);
        return;
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      cover_url = `${data.publicUrl}?t=${Date.now()}`;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim() || null,
        bio: bio.trim() || null,
        badge: selectedBadges.length > 0 ? selectedBadges.join(",") : null,
        is_verified: isVerified,
        avatar_url,
        cover_url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      setStatus("error");
      setErrorMsg(`Error: ${error.message}`);
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

      {/* Cover Photo */}
      <section className="bg-white dark:bg-[#111328] rounded-[1.5rem] overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
        <div className="relative w-full h-32 cursor-pointer group" onClick={() => coverRef.current?.click()}>
          {coverPreview ? (
            <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#0052d0] via-[#4527a0] to-[#8d3a8b]" />
          )}
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-white text-2xl">photo_camera</span>
            <span className="text-white font-bold text-sm">Cambiar portada</span>
          </div>
        </div>
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <p className="font-extrabold text-[#272b51] dark:text-[#c8ccf0]"
              style={{ fontFamily: "var(--font-plus-jakarta)" }}>
              Foto de Portada
            </p>
            <p className="text-xs text-[#a6aad7] mt-0.5">JPG, PNG · se muestra en tu perfil</p>
          </div>
          <button type="button" onClick={() => coverRef.current?.click()}
            className="text-xs text-[#0052d0] dark:text-[#5e8bff] font-bold hover:opacity-80 transition-opacity">
            Cambiar
          </button>
        </div>
        <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
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

      {/* Verified toggle */}
      <section className="bg-white dark:bg-[#111328] rounded-[1.5rem] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Animated verified preview */}
            <span className={`verified-badge inline-flex items-center justify-center w-8 h-8 rounded-full relative ${isVerified ? "" : "opacity-30"}`}>
              <span className="verified-ring absolute inset-0 rounded-full" />
              <span className="relative z-10 inline-flex items-center justify-center w-[28px] h-[28px] rounded-full bg-gradient-to-br from-[#0052d0] via-[#5e8bff] to-[#8d3a8b]">
                <span className="material-symbols-outlined text-white"
                  style={{ fontSize: "16px", fontVariationSettings: "'FILL' 1, 'wght' 700" }}>
                  check
                </span>
              </span>
            </span>
            <div>
              <h2 className="font-extrabold text-[#272b51] dark:text-[#c8ccf0]"
                style={{ fontFamily: "var(--font-plus-jakarta)" }}>
                Cuenta Verificada
              </h2>
              <p className="text-xs text-[#a6aad7] mt-0.5">
                Muestra el chulo verificado en tu perfil
              </p>
            </div>
          </div>
          {/* Toggle switch */}
          <button
            type="button"
            onClick={() => setIsVerified((v) => !v)}
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 flex-shrink-0 ${
              isVerified
                ? "bg-gradient-to-r from-[#0052d0] to-[#8d3a8b]"
                : "bg-[#e6e6ff] dark:bg-white/10"
            }`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${
              isVerified ? "translate-x-6" : "translate-x-0.5"
            }`} />
          </button>
        </div>
      </section>

      {/* Badge selector — multi-select */}
      <section className="bg-white dark:bg-[#111328] rounded-[1.5rem] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="font-extrabold text-[#272b51] dark:text-[#c8ccf0]"
              style={{ fontFamily: "var(--font-plus-jakarta)" }}>
              Role Badges
            </h2>
            <p className="text-xs text-[#a6aad7] mt-0.5">Selecciona uno o varios</p>
          </div>
          {selectedBadges.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedBadges([])}
              className="text-xs text-[#545881] dark:text-[#969ac6] hover:text-[#b31b25] transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">close</span>
              Quitar todos
            </button>
          )}
        </div>

        {/* Selected count pill */}
        {selectedBadges.length > 0 && (
          <div className="mb-4 flex items-center gap-2">
            <span className="text-xs font-bold bg-[#0052d0] text-white px-2.5 py-1 rounded-full">
              {selectedBadges.length} seleccionado{selectedBadges.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {badgeEntries.map(([id, b]) => {
            const isActive = selectedBadges.includes(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggleBadge(id)}
                className={`flex items-center gap-2 px-3 py-3 rounded-[1rem] ring-2 transition-all text-left ${
                  isActive
                    ? `${b.bg} ${b.text} ${b.border} ${b.darkBg} ${b.darkText} ring-2 scale-[1.02] shadow-md`
                    : "bg-[#f8f5ff] dark:bg-white/5 text-[#545881] dark:text-[#969ac6] ring-transparent hover:ring-[#a6aad7]/50"
                }`}
              >
                <span
                  className="material-symbols-outlined text-xl flex-shrink-0"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {b.icon}
                </span>
                <span className="text-xs font-semibold leading-tight flex-1">{b.label}</span>
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
        <p className="text-center text-sm text-[#b31b25] flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-base">error</span>
          {errorMsg || "Something went wrong. Try again."}
        </p>
      )}
    </form>
  );
}
