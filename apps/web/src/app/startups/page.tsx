import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = {
  title: "Startup ideas",
  description: "Pitch startup ideas, discover co-founders and upvote — SNEWS.INFO.",
};

export default function StartupsPage() {
  return (
    <ComingSoon
      title="Startup ideas hub"
      description="Pitch your idea, find co-founders and team members, and upvote the best student startups. Launching in Phase 3."
      cta={{ href: "/events", label: "Browse events meanwhile" }}
    />
  );
}
