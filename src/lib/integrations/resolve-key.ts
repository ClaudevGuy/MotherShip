import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/encryption";

/**
 * Resolves a provider API key for a given project.
 *
 * Lookup order:
 *   1. Integration row in Postgres (name === providerName, status === CONNECTED)
 *      — value is AES-256-GCM encrypted; we decrypt on the fly. If decrypt
 *        throws (legacy plaintext row), we use the raw value as a fallback.
 *   2. process.env[envVar] — developer-facing escape hatch for local dev.
 *
 * Each call emits a single structured log line so you can tell from the
 * server logs which source a key came from. This is the fix for the
 * "DB beats .env silently" rough edge — if a broken DB row is masking a
 * working .env key, the log makes it visible.
 *
 * Returns null if neither source has a key.
 */
export async function resolveProviderKey(
  projectId: string,
  providerName: string,
  envVar: string
): Promise<{ apiKey: string; source: "db" | "env-fallback" } | null> {
  const integration = await prisma.integration.findFirst({
    where: { projectId, name: providerName, status: "CONNECTED" },
  });

  if (integration) {
    const rawConfig = (integration.config as Record<string, string>) || {};
    for (const [, value] of Object.entries(rawConfig)) {
      try {
        const plaintext = decrypt(value);
        console.log(
          `[key-resolve] ${providerName} <- db project=${projectId} (envVar=${envVar} ${process.env[envVar] ? "set but masked" : "unset"})`
        );
        return { apiKey: plaintext, source: "db" };
      } catch {
        console.warn(
          `[key-resolve] ${providerName} <- db project=${projectId} (decrypt failed, using raw value — row predates encryption or ENCRYPTION_KEY rotated)`
        );
        return { apiKey: value, source: "db" };
      }
    }
    console.warn(
      `[key-resolve] ${providerName} <- db project=${projectId} row exists but config is empty, falling through to env`
    );
  }

  const envKey = process.env[envVar];
  if (envKey) {
    console.log(`[key-resolve] ${providerName} <- env ${envVar} (no connected db integration for project=${projectId})`);
    return { apiKey: envKey, source: "env-fallback" };
  }

  console.warn(
    `[key-resolve] ${providerName} MISS — no db integration for project=${projectId}, no ${envVar} in env`
  );
  return null;
}
