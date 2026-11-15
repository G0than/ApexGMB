import { AI_DEFAULTS, type AiModelId } from "../config/ai-models";
import { CoreError } from "../errors";
import { integrationEnv } from "../integrations";

export type AiRequest = {
  model: AiModelId;
  system: string;
  user: string;
  maxTokens: number;
};
export type AiResponse = { text: string; inputTokens: number; outputTokens: number };
export type AiModel = (req: AiRequest) => Promise<AiResponse>;

export const AI_NOT_SET_UP = "AI is not set up on this server";

type Env = Record<string, string | undefined>;
let override: { model?: AiModel; env?: Env } = {};
/** Tests only: a fake model and/or an injected env (cap, key). Pass {} to restore. */
export function setAiTestOverrides(o: { model?: AiModel; env?: Env }): void {
  override = o;
}
/** The env the AI code reads: injected in tests, otherwise process.env with in-app integration keys filled in. */
export function aiEnv(): Env {
  return override.env ?? integrationEnv();
}

/**
 * The model to call, or null when this server has no key. Never logs or returns the key; prompts and
 * outputs are never logged or placed in error messages.
 */
export function getAiModel(env: Env = aiEnv()): AiModel | null {
  if (override.model) return override.model;
  const anthropicKey = env.ANTHROPIC_API_KEY?.trim();
  const geminiKey = (env.GEMINI_API_KEY || env.GOOGLE_AI_API_KEY)?.trim();
  const openaiKey = env.OPENAI_API_KEY?.trim();
  const openrouterKey = env.OPENROUTER_API_KEY?.trim();

  if (!anthropicKey && !geminiKey && !openaiKey && !openrouterKey) return null;

  return async (req) => {
    // If OpenRouter key is provided and no specific native direct key is active, use OpenRouter
    if (openrouterKey && !anthropicKey && !geminiKey && !openaiKey) {
      return callOpenRouter(openrouterKey, req);
    }
    // Route according to model prefix or available keys
    if (req.model.startsWith("gemini-") || (geminiKey && !anthropicKey && !req.model.startsWith("gpt-"))) {
      if (geminiKey) return callGemini(geminiKey, req);
    }
    if (req.model.startsWith("gpt-") || (openaiKey && !anthropicKey && !geminiKey)) {
      if (openaiKey) return callOpenAI(openaiKey, req);
    }
    if (anthropicKey) {
      return callAnthropic(anthropicKey, req);
    }
    if (geminiKey) {
      return callGemini(geminiKey, req);
    }
    if (openaiKey) {
      return callOpenAI(openaiKey, req);
    }
    if (openrouterKey) {
      return callOpenRouter(openrouterKey, req);
    }
    throw new CoreError("CONFLICT", AI_NOT_SET_UP);
  };
}

export function aiIsOn(env: Env = aiEnv()): boolean {
  return Boolean(
    env.ANTHROPIC_API_KEY?.trim() ||
    env.GEMINI_API_KEY?.trim() ||
    env.GOOGLE_AI_API_KEY?.trim() ||
    env.OPENAI_API_KEY?.trim() ||
    env.OPENROUTER_API_KEY?.trim()
  );
}

/** OpenRouter API over fetch. Supports routing to any model via OpenAI-compatible endpoints. */
async function callOpenRouter(key: string, req: AiRequest): Promise<AiResponse> {
  const modelMap: Record<string, string> = {
    "gemini-2.5-flash": "google/gemini-2.5-flash",
    "gemini-2.5-pro": "google/gemini-2.5-pro",
    "claude-haiku-5-5": "anthropic/claude-3.5-haiku",
    "claude-sonnet-5-5": "anthropic/claude-3.7-sonnet",
    "gpt-4o-mini": "openai/gpt-4o-mini",
    "gpt-4o": "openai/gpt-4o",
  };
  const model = modelMap[req.model] || "google/gemini-2.5-flash";
  let res: Response;
  try {
    res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        authorization: `Bearer ${key}`,
        "content-type": "application/json",
        "http-referer": "https://opengmb.synectus.com",
        "x-title": "OpenGMB",
      },
      body: JSON.stringify({
        model,
        max_tokens: Math.min(req.maxTokens || 1000, 2000),
        messages: [
          ...(req.system ? [{ role: "system", content: req.system }] : []),
          { role: "user", content: req.user },
        ],
      }),
      signal: AbortSignal.timeout(AI_DEFAULTS.requestTimeoutMs),
    });
  } catch {
    throw new CoreError("CONFLICT", "The OpenRouter service could not be reached. Try again.");
  }
  if (!res.ok) {
    throw new CoreError("CONFLICT", `OpenRouter answered with an error (HTTP ${res.status}).`);
  }
  const body = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  };
  const inputTokens = body.usage?.prompt_tokens ?? 0;
  const outputTokens = body.usage?.completion_tokens ?? 0;
  const text = (body.choices?.[0]?.message?.content ?? "").trim();
  return { text, inputTokens, outputTokens };
}

/** Google Gemini API over fetch. */
async function callGemini(key: string, req: AiRequest): Promise<AiResponse> {
  const modelName = req.model.startsWith("gemini-") ? req.model : "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(key)}`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        system_instruction: req.system ? { parts: [{ text: req.system }] } : undefined,
        contents: [{ role: "user", parts: [{ text: req.user }] }],
        generationConfig: { maxOutputTokens: req.maxTokens },
      }),
      signal: AbortSignal.timeout(AI_DEFAULTS.requestTimeoutMs),
    });
  } catch {
    throw new CoreError("CONFLICT", "The Gemini AI service could not be reached. Try again.");
  }
  if (!res.ok) {
    throw new CoreError("CONFLICT", `The Gemini AI service answered with an error (HTTP ${res.status}).`);
  }
  const body = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
    usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number };
  };
  const inputTokens = body.usageMetadata?.promptTokenCount ?? 0;
  const outputTokens = body.usageMetadata?.candidatesTokenCount ?? 0;
  const text = (body.candidates?.[0]?.content?.parts ?? [])
    .map((p) => p.text ?? "")
    .join("")
    .trim();
  return { text, inputTokens, outputTokens };
}

/** OpenAI Chat Completions API over fetch. */
async function callOpenAI(key: string, req: AiRequest): Promise<AiResponse> {
  const modelName = req.model.startsWith("gpt-") ? req.model : "gpt-4o-mini";
  let res: Response;
  try {
    res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        authorization: `Bearer ${key}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: modelName,
        max_tokens: req.maxTokens,
        messages: [
          ...(req.system ? [{ role: "system", content: req.system }] : []),
          { role: "user", content: req.user },
        ],
      }),
      signal: AbortSignal.timeout(AI_DEFAULTS.requestTimeoutMs),
    });
  } catch {
    throw new CoreError("CONFLICT", "The OpenAI service could not be reached. Try again.");
  }
  if (!res.ok) {
    throw new CoreError("CONFLICT", `The OpenAI service answered with an error (HTTP ${res.status}).`);
  }
  const body = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  };
  const inputTokens = body.usage?.prompt_tokens ?? 0;
  const outputTokens = body.usage?.completion_tokens ?? 0;
  const text = (body.choices?.[0]?.message?.content ?? "").trim();
  return { text, inputTokens, outputTokens };
}

/** Anthropic Messages API over fetch. Errors carry the HTTP status only, never the body. */
async function callAnthropic(key: string, req: AiRequest): Promise<AiResponse> {
  let res: Response;
  try {
    res = await fetch(AI_DEFAULTS.apiUrl, {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": AI_DEFAULTS.anthropicVersion,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: req.model,
        max_tokens: req.maxTokens,
        system: req.system,
        messages: [{ role: "user", content: req.user }],
        output_config: { effort: "low" },
      }),
      signal: AbortSignal.timeout(AI_DEFAULTS.requestTimeoutMs),
    });
  } catch {
    throw new CoreError("CONFLICT", "The AI service could not be reached. Try again.");
  }
  if (!res.ok) {
    throw new CoreError("CONFLICT", `The AI service answered with an error (HTTP ${res.status}).`);
  }
  const body = (await res.json()) as {
    content?: { type: string; text?: string }[];
    usage?: { input_tokens?: number; output_tokens?: number };
  };
  const inputTokens = body.usage?.input_tokens ?? 0;
  const outputTokens = body.usage?.output_tokens ?? 0;
  // A refusal has no text: it is metered, then the empty draft is blocked by the guardrails (U.empty).
  const text = (body.content ?? [])
    .filter((b) => b.type === "text")
    .map((b) => b.text ?? "")
    .join("")
    .trim();
  return { text, inputTokens, outputTokens };
}
