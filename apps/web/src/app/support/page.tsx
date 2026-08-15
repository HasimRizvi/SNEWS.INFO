import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = {
  title: "Chat support",
  description: "Live chat support on SNEWS.INFO.",
};

export default function SupportPage() {
  return (
    <ComingSoon
      title="Chat support"
      description="A real-time support chat with our team — responses within minutes during working hours. Launching in Phase 4."
      cta={{ href: "/events", label: "Browse events meanwhile" }}
    />
  );
}
