import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = {
  title: "Research papers",
  description: "New and reference research papers with AI summaries — SNEWS.INFO research library.",
};

export default function ResearchPage() {
  return (
    <ComingSoon
      title="Research paper library"
      description="New papers and a searchable reference archive, with AI summaries for every entry. Launching in Phase 2."
      cta={{ href: "/events", label: "Browse events meanwhile" }}
    />
  );
}
