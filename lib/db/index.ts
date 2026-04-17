import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "./schema";
import { mkdirSync, existsSync } from "fs";
import { join } from "path";

type DbInstance = ReturnType<typeof drizzle<typeof schema>>;

declare const globalThis: {
  __db?: DbInstance;
};

function createDb(): DbInstance {
  const dataDir = join(process.cwd(), "data");
  mkdirSync(dataDir, { recursive: true });
  mkdirSync(join(dataDir, "audio"), { recursive: true });

  const dbPath = join(dataDir, "monitor.db");
  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  sqlite.pragma("busy_timeout = 5000");

  const d = drizzle(sqlite, { schema });

  const migrationsDir = join(process.cwd(), "drizzle");
  if (existsSync(migrationsDir)) {
    try {
      migrate(d, { migrationsFolder: migrationsDir });
    } catch {
      // migrations may not exist yet
    }
  }

  return d;
}

function getDb(): DbInstance {
  if (globalThis.__db) return globalThis.__db;
  const instance = createDb();
  if (process.env.NODE_ENV !== "production") {
    globalThis.__db = instance;
  }
  return instance;
}

// Lazy proxy: DB connection is only opened when first accessed
export const db: DbInstance = new Proxy({} as DbInstance, {
  get(_target, prop) {
    const instance = getDb();
    const value = instance[prop as keyof DbInstance];
    if (typeof value === "function") {
      return value.bind(instance);
    }
    return value;
  },
});
