import { classifyOpportunity } from "@snews/ai";

export interface EventReviewResult {
  riskScore: number;
  isLikelyLegitimate: boolean;
  notes: string;
}

/**
 * AI review for a submitted event. Designed to never block the pipeline:
 * - No API key configured  → returns null (manual review only)
 * - AI call fails          → exception propagates, caller falls back
 * - AI returns nonsense    → clamped/validated here
 */
export async function reviewEventWithAI(eventText: string): Promise<EventReviewResult | null> {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }

  const classification = await classifyOpportunity(eventText);

  return {
    riskScore: Math.max(0, Math.min(100, classification.riskScore)),
    isLikelyLegitimate: classification.isLikelyLegitimate,
    notes: `AI classified as "${classification.type}" — risk score ${classification.riskScore}/100. ${
      classification.isLikelyLegitimate ? "Looks legitimate." : "Flagged for extra review."
    }`,
  };
}
