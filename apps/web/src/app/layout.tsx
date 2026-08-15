import type { Metadata } from "next";
import "./globals.css";
import { Navbar, Footer } from "@snews/ui";
import { createClient } from "@/lib/supabase/server";
import { UserMenu } from "@/components/user-menu";

export const metadata: Metadata = {
  title: {
    default: "SNEWS.INFO — Student Opportunity & Innovation Network",
    template: "%s · SNEWS.INFO",
  },
  description:
    "One trusted platform where students discover verified hackathons, internships, research papers, startup ideas, communities and funding.",
  keywords: [
    "hackathon",
    "internship",
    "research papers",
    "startup ideas",
    "student community",
    "CrewIn",
    "free online sessions",
    "freelancing",
  ],
  openGraph: {
    title: "SNEWS.INFO — Student Opportunity & Innovation Network",
    description:
      "Discover, verify and participate in hackathons, internships, research and startup opportunities.",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: { full_name: string | null; avatar_url: string | null } | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", user.id)
      .maybeSingle();
    profile = data;
  }

  const navUser = user
    ? {
        fullName: profile?.full_name ?? user.user_metadata?.full_name ?? null,
        email: user.email ?? "",
        avatarUrl: profile?.avatar_url ?? null,
      }
    : null;

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <Navbar
          user={navUser}
          userMenu={
            navUser ? (
              <UserMenu
                fullName={navUser.fullName}
                email={navUser.email}
                avatarUrl={navUser.avatarUrl}
              />
            ) : undefined
          }
        />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
