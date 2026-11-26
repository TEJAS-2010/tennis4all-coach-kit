/**
 * Default model id from the AI Gateway catalog on 26 November 2026.
 * `google/gemini-3.8-flash` is the newest Gemini Flash that advertises structured output.
 * Override it with AI_GATEWAY_MODEL if the catalog moves on.
 */
export const DEFAULT_GATEWAY_MODEL = "google/gemini-3.8-flash";

export function gatewayModel(): string {
  const configured = process.env.AI_GATEWAY_MODEL?.trim();
  return configured && configured.length > 0 ? configured : DEFAULT_GATEWAY_MODEL;
}

export function gatewayConfigured(): boolean {
  if (process.env.AI_GATEWAY_API_KEY?.trim()) return true;
  if (process.env.VERCEL_OIDC_TOKEN?.trim()) return true;
  // Vercel can attach OIDC on the request even when the env var is not
  // visible at module load. Local runs do not set VERCEL, so they stay offline.
  return process.env.VERCEL === "1";
}
