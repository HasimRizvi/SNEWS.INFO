import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = {
  title: "Opportunities",
  description: "Verified internships, funding, legal support, freelancing — official sources only.",
};

export default function ResourcesPage() {
  return (
    <ComingSoon
      title="Opportunities board"
      description="Internships, funding, legal support and freelance gigs — always linked to official sources and marked with a last-verified date. Launching in Phase 2."
      cta={{ href: "/events", label: "Browse events meanwhile" }}
    />
  );
}
