import Link from "next/link";

export default function ProfileNotFound() {
  return (
    <div className="min-h-screen bg-[#f8f5ff] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-24 h-24 rounded-full bg-[#f1efff] flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-[#a6aad7] text-5xl">
            person_off
          </span>
        </div>
        <h1
          className="text-2xl font-extrabold text-[#272b51] mb-2"
          style={{ fontFamily: "var(--font-plus-jakarta)" }}
        >
          User not found
        </h1>
        <p className="text-[#545881] mb-8">
          This profile doesn&apos;t exist or has been removed.
        </p>
        <Link
          href="/"
          className="bg-gradient-to-br from-[#0052d0] to-[#799dff] text-[#f1f2ff] font-bold py-3 px-8 rounded-full shadow-[0_8px_24px_rgba(0,82,208,0.2)] hover:opacity-90 transition-opacity"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
