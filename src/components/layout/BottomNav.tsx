import Link from "next/link";

const navItems = [
  { href: "/", icon: "home", label: "Home" },
  { href: "/discover", icon: "explore", label: "Discover" },
  { href: "/inbox", icon: "mail", label: "Inbox" },
  { href: "/profile", icon: "person", label: "Profile" },
];

export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 bg-white/85 backdrop-blur-3xl rounded-t-3xl shadow-[0_-8px_24px_rgba(0,0,0,0.04)] z-50">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary transition-colors active:opacity-70"
        >
          <span className="material-symbols-outlined">{item.icon}</span>
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            {item.label}
          </span>
        </Link>
      ))}
    </nav>
  );
}
