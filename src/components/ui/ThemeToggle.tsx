"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    // Read the class set by the inline script (already applied before hydration)
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <button
      onClick={toggle}
      suppressHydrationWarning
      className="p-2 text-[#545881] dark:text-[#969ac6] hover:bg-[#f1efff] dark:hover:bg-white/10 rounded-full transition-colors"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
    >
      <span
        className="material-symbols-outlined text-2xl"
        style={{ fontVariationSettings: "'FILL' 1" }}
        suppressHydrationWarning
      >
        {dark ? "light_mode" : "dark_mode"}
      </span>
    </button>
  );
}
