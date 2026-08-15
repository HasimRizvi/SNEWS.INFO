export interface GeminiConfig {
  apiKey: string;
  model: string;
  baseUrl: string;
  timeoutMs: number;
  maxRetries: number;
}

export interface GeminiRequestOptions {
  systemPrompt?: string;
  temperature?: number;
  maxOutputTokens?: number;
  jsonMode?: boolean;
}

export interface GeminiError {
  code: string;
  message: string;
}

function loadConfig(): GeminiConfig {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in the environment.");
  }
  return {
    apiKey,
    model: process.env.GEMINI_MODEL ?? "gemini-flash-latest",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    timeoutMs: 30_000,
    maxRetries: 2,
  };
}

function buildRequestBody(
  prompt: string,
  options: GeminiRequestOptions,
): Record<string, unknown> {
  const contents = [
    ...(options.systemPrompt ? [{ role: "user", parts: [{ text: options.systemPrompt }] }] : []),
    { role: "user", parts: [{ text: prompt }] },
  ];
  const generationConfig: Record<string, unknown> = {
    temperature: options.temperature ?? 0.2,
    maxOutputTokens: options.maxOutputTokens ?? 1024,
  };
  if (options.jsonMode) {
    generationConfig.responseMimeType = "application/json";
  }
  return { contents, generationConfig };
}

function extractText(payload: Record<string, unknown>): string {
  const candidates = payload.candidates;
  if (Array.isArray(candidates) && candidates.length > 0) {
    const first = candidates[0] as Record<string, unknown>;
    const content = first.content as Record<string, unknown>;
    const parts = content.parts;
    if (Array.isArray(parts) && parts.length > 0) {
      const text = (parts[0] as Record<string, unknown>).text;
      if (typeof text === "string") {
        return text;
      }
    }
  }
  throw new Error("Gemini response did not contain any text.");
}

/**
 * Minimal, dependency-free client for the Gemini REST API.
 * Returns the raw text completion for a prompt. Retries transient failures.
 */
export async function generateText(
  prompt: string,
  options: GeminiRequestOptions = {},
): Promise<string> {
  const config = loadConfig();
  const url = `${config.baseUrl}/models/${config.model}:generateContent?key=${encodeURIComponent(config.apiKey)}`;
  const body = buildRequestBody(prompt, options);

  let lastError: GeminiError | null = null;
  for (let attempt = 0; attempt <= config.maxRetries; attempt += 1) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), config.timeoutMs);
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!response.ok) {
        const raw = await response.text();
        throw new Error(`Gemini API error ${response.status}: ${raw.slice(0, 500)}`);
      }
      const payload = (await response.json()) as Record<string, unknown>;
      return extractText(payload);
    } catch (error) {
      lastError = {
        code: "GEMINI_REQUEST_FAILED",
        message: error instanceof Error ? error.message : String(error),
      };
      const shouldRetry = attempt < config.maxRetries && !(error instanceof Error && error.name === "AbortError");
      if (!shouldRetry) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** attempt));
    }
  }
  throw new Error(`${lastError?.code ?? "GEMINI_ERROR"}: ${lastError?.message ?? "unknown failure"}`);
}

/**
 * Generate JSON from Gemini with strict schema enforcement.
 * Parses the response and validates it against the provided parser,
 * so malformed AI output can never crash the application.
 */
export async function generateJson<T>(
  prompt: string,
  options: GeminiRequestOptions & { schema: unknown },
): Promise<T> {
  const raw = await generateText(prompt, { ...options, jsonMode: true });
  const json = raw.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
  const parsed = JSON.parse(json) as unknown;
  return validateSchema(parsed, options.schema) as T;
}

function validateSchema(value: unknown, schema: unknown): unknown {
  if (schema === null || typeof schema !== "object") {
    return value;
  }
  const shape = schema as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  if (typeof value !== "object" || value === null) {
    throw new Error("AI returned a non-object where an object was required.");
  }
  const record = value as Record<string, unknown>;
  for (const [key, type] of Object.entries(shape)) {
    if (type === "string") {
      if (typeof record[key] !== "string") throw new Error(`AI field "${key}" must be a string.`);
      out[key] = record[key];
    } else if (type === "number") {
      if (typeof record[key] !== "number" || Number.isNaN(record[key])) {
        throw new Error(`AI field "${key}" must be a number.`);
      }
      out[key] = record[key];
    } else if (type === "boolean") {
      if (typeof record[key] !== "boolean") throw new Error(`AI field "${key}" must be a boolean.`);
      out[key] = record[key];
    } else if (Array.isArray(type)) {
      if (!Array.isArray(record[key])) throw new Error(`AI field "${key}" must be an array.`);
      out[key] = record[key];
    } else {
      out[key] = record[key];
    }
  }
  return out;
}
