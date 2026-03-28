import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Redirect to the user's own public profile
export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) redirect("/login");

  redirect(`/u/${profile.username}`);
}
