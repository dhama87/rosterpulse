import path from "path";
import Database from "better-sqlite3";
import { createTables } from "./schema";

export const DB_PATH = path.join(process.cwd(), "data", "rosterpulse.db");

let instance: InstanceType<typeof Database> | null = null;

export function getDb(dbPath: string = DB_PATH): InstanceType<typeof Database> {
  if (instance) {
    return instance;
  }

  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  createTables(db);

  instance = db;
  return instance;
}

export function closeDb(): void {
  if (instance) {
    instance.close();
    instance = null;
  }
}
