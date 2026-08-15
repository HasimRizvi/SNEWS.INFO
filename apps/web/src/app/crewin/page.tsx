import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = {
  title: "CrewIn community",
  description: "Grow-together communities on SNEWS.INFO — skill groups, college chapters, startup crews.",
};

export default function CrewinPage() {
  return (
    <ComingSoon
      title="CrewIn community"
      description="Grow-together circles: skill groups, college chapters and startup crews where students help each other rise. Launching in Phase 3."
      cta={{ href: "/events", label: "Browse events meanwhile" }}
    />
  );
}
