-- Initial schema for QuickNotes: accounts and notes.
-- Constraints are chosen to prevent data loss / orphaned rows:
--   * accounts.email is unique and required
--   * notes.owner must reference an existing account (foreign key)
--   * deleting an account's notes requires an explicit cascade, not silent loss

CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro'))
);

CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  pro INTEGER NOT NULL DEFAULT 0 CHECK (pro IN (0, 1))
);

CREATE INDEX IF NOT EXISTS idx_notes_owner ON notes(owner);

INSERT OR IGNORE INTO accounts (id, email, plan) VALUES ('u1', 'sam@quicknotes.test', 'free');

INSERT OR IGNORE INTO notes (id, owner, title, body, pro) VALUES
  (1, 'u1', 'Groceries', 'eggs, oat milk, (lots of) coffee', 0),
  (2, 'u1', 'Pitch deck', 'Problem, solution, traction, ask', 1);