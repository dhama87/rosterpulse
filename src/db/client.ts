import { createClient, type Client } from "@libsql/client";

let instance: Client | null = null;

export function getDb(): Client {
  if (instance) {
    return instance;
  }

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    throw new Error(
      `TURSO_DATABASE_URL is not set. Available env keys: ${Object.keys(process.env).filter(k => k.startsWith('TURSO')).join(', ') || 'none'}`
    );
  }

  // Turso URLs use libsql:// but HTTP transport needs https://
  const normalizedUrl = url.replace(/^libsql:\/\//, "https://").trim();

  try {
    instance = createClient({ url: normalizedUrl, authToken });
  } catch (err) {
    throw new Error(
      `Failed to create Turso client. URL prefix: "${normalizedUrl.slice(0, 30)}...", authToken present: ${!!authToken}. Original: ${err instanceof Error ? err.message : String(err)}`
    );
  }
  return instance;
}

export function closeDb(): void {
  if (instance) {
    instance.close();
    instance = null;
  }
}
