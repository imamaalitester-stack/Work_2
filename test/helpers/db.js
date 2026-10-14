import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Database from "better-sqlite3";
import { runMigrations } from "../../src/migrate.js";

// Creates a throwaway SQLite database file for a test run, applies the
// project's migrations against it, and returns both the raw connection and
// a cleanup function. Keeping this isolated from the real DATABASE_PATH
// means tests never touch developer or production data.
export function createTestDatabase() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "quicknotes-test-"));
  const dbPath = path.join(dir, "test.db");
  const sqlite = new Database(dbPath);
  runMigrations(sqlite);
  return {
    sqlite,
    dbPath,
    cleanup: () => {
      sqlite.close();
      fs.rmSync(dir, { recursive: true, force: true });
    },
  };
}

// Mirrors the row<->object mapping used in src/db.js, needed because the
// raw sqlite rows store `pro` as 0/1 rather than a boolean.
export function rowToNote(row) {
  if (!row) return null;
  return { ...row, pro: !!row.pro };
}