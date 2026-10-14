import { openDatabase } from "./migrate.js";

const sqlite = openDatabase();

function rowToNote(row) {
  if (!row) return null;
  return { ...row, pro: !!row.pro };
}

export const db = {
  notes: {
    list: () => sqlite.prepare("SELECT * FROM notes").all().map(rowToNote),
    get: (id) => rowToNote(sqlite.prepare("SELECT * FROM notes WHERE id = ?").get(id)),
    insert: (row) => {
      const info = sqlite
        .prepare("INSERT INTO notes (owner, title, body, pro) VALUES (?, ?, ?, ?)")
        .run(row.owner, row.title, row.body ?? "", row.pro ? 1 : 0);
      return db.notes.get(info.lastInsertRowid);
    },
    delete: (id) => sqlite.prepare("DELETE FROM notes WHERE id = ?").run(id).changes > 0,
  },
  accounts: {
    get: (id) => sqlite.prepare("SELECT * FROM accounts WHERE id = ?").get(id) ?? null,
    update: (id, patch) => {
      const current = db.accounts.get(id);
      if (!current) return null;
      const merged = { ...current, ...patch };
      sqlite
        .prepare("UPDATE accounts SET email = ?, plan = ? WHERE id = ?")
        .run(merged.email, merged.plan, id);
      return db.accounts.get(id);
    },
  },
};
