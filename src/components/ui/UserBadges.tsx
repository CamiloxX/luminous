export type BadgeId =
  | "google_dev"
  | "microsoft_dev"
  | "meta_dev"
  | "apple_dev"
  | "amazon_dev"
  | "netflix_dev"
  | "open_source"
  | "content_creator"
  | "designer"
  | "student"
  | "security"
  | "ai_researcher"
  | "indie_dev"
  | "streamer";

interface BadgeDef {
  label: string;
  icon: string; // Material Symbol name
  bg: string;
  text: string;
  border: string;
  darkBg: string;
  darkText: string;
}

export const BADGES: Record<BadgeId, BadgeDef> = {
  google_dev: {
    label: "Google Developer",
    icon: "code",
    bg: "bg-[#e8f5e9]",
    text: "text-[#1a7340]",
    border: "ring-[#34a853]/30",
    darkBg: "dark:bg-[#1a7340]/20",
    darkText: "dark:text-[#34a853]",
  },
  microsoft_dev: {
    label: "Microsoft Dev",
    icon: "window",
    bg: "bg-[#e3f2fd]",
    text: "text-[#0078d4]",
    border: "ring-[#0078d4]/30",
    darkBg: "dark:bg-[#0078d4]/20",
    darkText: "dark:text-[#60b4ff]",
  },
  meta_dev: {
    label: "Meta Engineer",
    icon: "hub",
    bg: "bg-[#e8eaf6]",
    text: "text-[#1877f2]",
    border: "ring-[#1877f2]/30",
    darkBg: "dark:bg-[#1877f2]/20",
    darkText: "dark:text-[#74a7ff]",
  },
  apple_dev: {
    label: "Apple Developer",
    icon: "laptop_mac",
    bg: "bg-[#f3f3f3]",
    text: "text-[#555555]",
    border: "ring-[#555]/30",
    darkBg: "dark:bg-white/10",
    darkText: "dark:text-white",
  },
  amazon_dev: {
    label: "AWS Engineer",
    icon: "cloud",
    bg: "bg-[#fff8e1]",
    text: "text-[#e47911]",
    border: "ring-[#e47911]/30",
    darkBg: "dark:bg-[#e47911]/20",
    darkText: "dark:text-[#ffb347]",
  },
  netflix_dev: {
    label: "Netflix Engineer",
    icon: "play_circle",
    bg: "bg-[#fce4ec]",
    text: "text-[#e50914]",
    border: "ring-[#e50914]/30",
    darkBg: "dark:bg-[#e50914]/20",
    darkText: "dark:text-[#ff6b74]",
  },
  open_source: {
    label: "Open Source",
    icon: "diversity_3",
    bg: "bg-[#f3e5f5]",
    text: "text-[#7b1fa2]",
    border: "ring-[#7b1fa2]/30",
    darkBg: "dark:bg-[#7b1fa2]/20",
    darkText: "dark:text-[#ce93d8]",
  },
  content_creator: {
    label: "Creator",
    icon: "videocam",
    bg: "bg-[#fff3e0]",
    text: "text-[#e65100]",
    border: "ring-[#e65100]/30",
    darkBg: "dark:bg-[#e65100]/20",
    darkText: "dark:text-[#ffb74d]",
  },
  designer: {
    label: "Designer",
    icon: "palette",
    bg: "bg-[#fce4ec]",
    text: "text-[#c2185b]",
    border: "ring-[#c2185b]/30",
    darkBg: "dark:bg-[#c2185b]/20",
    darkText: "dark:text-[#f48fb1]",
  },
  student: {
    label: "Student",
    icon: "school",
    bg: "bg-[#e0f7fa]",
    text: "text-[#00695c]",
    border: "ring-[#00695c]/30",
    darkBg: "dark:bg-[#00695c]/20",
    darkText: "dark:text-[#4db6ac]",
  },
  security: {
    label: "Security",
    icon: "shield",
    bg: "bg-[#e8f5e9]",
    text: "text-[#2e7d32]",
    border: "ring-[#2e7d32]/30",
    darkBg: "dark:bg-[#2e7d32]/20",
    darkText: "dark:text-[#81c784]",
  },
  ai_researcher: {
    label: "AI Researcher",
    icon: "smart_toy",
    bg: "bg-[#ede7f6]",
    text: "text-[#4527a0]",
    border: "ring-[#4527a0]/30",
    darkBg: "dark:bg-[#4527a0]/20",
    darkText: "dark:text-[#b39ddb]",
  },
  indie_dev: {
    label: "Indie Dev",
    icon: "rocket_launch",
    bg: "bg-[#e8eaf6]",
    text: "text-[#283593]",
    border: "ring-[#283593]/30",
    darkBg: "dark:bg-[#283593]/20",
    darkText: "dark:text-[#9fa8da]",
  },
  streamer: {
    label: "Streamer",
    icon: "live_tv",
    bg: "bg-[#f3e5f5]",
    text: "text-[#6a1b9a]",
    border: "ring-[#6a1b9a]/30",
    darkBg: "dark:bg-[#6a1b9a]/20",
    darkText: "dark:text-[#ce93d8]",
  },
};

interface Props {
  badge: string | null;
  isVerified: boolean;
  size?: "sm" | "md";
}

export default function UserBadges({ badge, isVerified, size = "md" }: Props) {
  const iconSize = size === "sm" ? "text-[13px]" : "text-[15px]";
  const textSize = size === "sm" ? "text-[10px]" : "text-xs";
  const px = size === "sm" ? "px-1.5 py-0.5" : "px-2 py-1";

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {/* Verified checkmark */}
      {isVerified && (
        <span
          title="Verified"
          className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#0052d0] dark:bg-[#5e8bff] flex-shrink-0"
        >
          <span
            className="material-symbols-outlined text-white"
            style={{
              fontSize: "13px",
              fontVariationSettings: "'FILL' 1, 'wght' 700",
            }}
          >
            check
          </span>
        </span>
      )}

      {/* Role badge */}
      {badge && BADGES[badge as BadgeId] && (() => {
        const b = BADGES[badge as BadgeId];
        return (
          <span
            title={b.label}
            className={`inline-flex items-center gap-1 ${px} rounded-full ring-1 ${b.bg} ${b.text} ${b.border} ${b.darkBg} ${b.darkText} font-semibold leading-none`}
          >
            <span
              className={`material-symbols-outlined ${iconSize}`}
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {b.icon}
            </span>
            <span className={textSize}>{b.label}</span>
          </span>
        );
      })()}
    </div>
  );
}
