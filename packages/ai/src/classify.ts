import { EVENT_TYPES } from "@snews/db";
import { generateJson } from "./client";

export interface ClassifiedOpportunity {
  type: string;
  title: string;
  summary: string;
  skills: string[];
  riskScore: number;
  isLikelyLegitimate: boolean;
}

const CLASSIFICATION_SCHEMA = {
  type: "string",
  title: "string",
  summary: "string",
  skills: [],
  riskScore: "number",
  isLikelyLegitimate: "boolean",
};

const CLASSIFICATION_SYSTEM = `You are an opportunity classifier for SNEWS.INFO, a trusted student platform.
Classify the given opportunity into exactly one of: ${EVENT_TYPES.join(", ")}.
Return JSON only with keys: type, title, summary, skills, riskScore, isLikelyLegitimate.
riskScore is 0-100 where 100 means high risk of being fake, spam or harmful.
isLikelyLegitimate is false if the listing looks fake, asks for money, or lacks verifiable details.`;

/**
 * Classify a raw opportunity listing (from a source scrape or manual submission)
 * into a typed, structured event draft with a risk score.
 */
export async function classifyOpportunity(rawText: string): Promise<ClassifiedOpportunity> {
  const result = await generateJson<ClassifiedOpportunity>(
    `Classify this opportunity listing:\n\n${rawText.slice(0, 4000)}`,
    {
      systemPrompt: CLASSIFICATION_SYSTEM,
      schema: CLASSIFICATION_SCHEMA,
      temperature: 0.1,
      maxOutputTokens: 700,
    },
  );

  if (!EVENT_TYPES.includes(result.type as (typeof EVENT_TYPES)[number])) {
    throw new Error(`AI classified the opportunity as unknown type "${result.type}".`);
  }

  const clampedScore = Math.max(0, Math.min(100, result.riskScore));
  return { ...result, riskScore: clampedScore };
}
