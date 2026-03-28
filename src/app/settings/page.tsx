import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";
import SettingsForm from "./SettingsForm";

export const metadata = { title: "Settings — Luminous" };

export default async function SettingsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) redirect("/login");

  return (
    <>
      <TopBar userId={user.id} />
      <main className="max-w-xl mx-auto px-4 pt-24 pb-28 md:pb-12">
        <h1
          className="text-3xl font-extrabold text-[#272b51] dark:text-[#c8ccf0] tracking-tight mb-8"
          style={{ fontFamily: "var(--font-plus-jakarta)" }}
        >
          Settings
        </h1>
        <SettingsForm profile={profile} userId={user.id} />
      </main>
      <BottomNav />
    </>
  );
}
