import { createClient, type Client } from "@libsql/client";

let instance: Client | null = null;

export function getDb(): Client {
  if (instance) {
    return instance;
  }

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    throw new Error("TURSO_DATABASE_URL is not set");
  }

  instance = createClient({ url, authToken });
  return instance;
}

export function closeDb(): void {
  if (instance) {
    instance.close();
    instance = null;
  }
}
