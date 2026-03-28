import Link from "next/link";
import NotificationBell from "@/components/ui/NotificationBell";
import ThemeToggle from "@/components/ui/ThemeToggle";

interface Props {
  userId?: string | null;
}

export default function TopBar({ userId }: Props) {
  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-white/85 backdrop-blur-3xl shadow-[0_12px_32px_rgba(0,0,0,0.06)]">
        <div className="flex justify-between items-center px-6 py-3 max-w-7xl mx-auto">
          <Link
            href="/"
            className="text-2xl font-black text-[#0052d0] tracking-tighter italic"
            style={{ fontFamily: "var(--font-plus-jakarta)" }}
          >
            Luminous
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-[#0052d0] font-bold tracking-tight"
              style={{ fontFamily: "var(--font-plus-jakarta)" }}>Home</Link>
            <Link href="/discover" className="text-[#545881] font-bold tracking-tight hover:text-[#272b51] transition-colors px-2"
              style={{ fontFamily: "var(--font-plus-jakarta)" }}>Discover</Link>
            {userId && (
              <Link href="/inbox" className="text-[#545881] font-bold tracking-tight hover:text-[#272b51] transition-colors px-2"
                style={{ fontFamily: "var(--font-plus-jakarta)" }}>Inbox</Link>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#70749e] text-xl">search</span>
              <input
                className="bg-[#f1efff] rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#0052d0]/30 w-52 transition"
                placeholder="Search questions..."
                type="text"
              />
            </div>

            <ThemeToggle />

            {userId ? (
              <>
                <NotificationBell userId={userId} />
                <Link
                  href="/settings"
                  className="p-2 text-[#545881] dark:text-[#969ac6] hover:bg-[#f1efff] dark:hover:bg-white/10 rounded-full transition-colors"
                  title="Settings"
                >
                  <span className="material-symbols-outlined text-2xl">account_circle</span>
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="text-[#0052d0] font-bold text-sm hover:opacity-80 transition-opacity px-3">
                  Sign in
                </Link>
                <Link href="/register"
                  className="bg-gradient-to-br from-[#0052d0] to-[#799dff] text-white font-bold text-sm py-2 px-4 rounded-full shadow-[0_4px_12px_rgba(0,82,208,0.2)] active:scale-95 transition-all">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* FAB */}
      {userId && (
        <button
          id="open-ask-modal"
          className="fixed bottom-24 right-6 md:bottom-12 md:right-12 w-16 h-16 bg-gradient-to-br from-[#0052d0] to-[#799dff] text-white rounded-full shadow-[0_12px_32px_rgba(0,82,208,0.3)] flex items-center justify-center group active:scale-90 transition-transform z-40"
        >
          <span className="material-symbols-outlined text-3xl transition-transform group-hover:rotate-12">edit_square</span>
        </button>
      )}
    </>
  );
}
