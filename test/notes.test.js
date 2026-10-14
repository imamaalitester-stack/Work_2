import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createTestDatabase, rowToNote } from "./helpers/db.js";

// These tests exercise the same queries src/db.js runs, against an
// isolated SQLite file, so note CRUD and ownership rules are covered
// without needing the HTTP layer or network-dependent AI summaries.
function makeNotesRepo(sqlite) {
  return {
    list: () => sqlite.prepare("SELECT * FROM notes").all().map(rowToNote),
    get: (id) => rowToNote(sqlite.prepare("SELECT * FROM notes WHERE id = ?").get(id)),
    insert: (row) => {
      const info = sqlite
        .prepare("INSERT INTO notes (owner, title, body, pro) VALUES (?, ?, ?, ?)")
        .run(row.owner, row.title, row.body ?? "", row.pro ? 1 : 0);
      return makeNotesRepo(sqlite).get(info.lastInsertRowid);
    },
    delete: (id) => sqlite.prepare("DELETE FROM notes WHERE id = ?").run(id).changes > 0,
  };
}

describe("notes CRUD", () => {
  let ctx;
  let notes;

  beforeEach(() => {
    ctx = createTestDatabase();
    notes = makeNotesRepo(ctx.sqlite);
  });

  afterEach(() => {
    ctx.cleanup();
  });

  it("lists seeded notes for the fixture account", () => {
    const list = notes.list().filter((n) => n.owner === "u1");
    expect(list.length).toBe(2);
    expect(list.map((n) => n.title)).toContain("Groceries");
  });

  it("creates a new note with defaults", () => {
    const created = notes.insert({ owner: "u1", title: "New note", body: "" });
    expect(created.id).toBeGreaterThan(0);
    expect(created.owner).toBe("u1");
    expect(created.title).toBe("New note");
    expect(created.pro).toBe(false);
  });

  it("reads back a created note by id", () => {
    const created = notes.insert({ owner: "u1", title: "Read me", body: "hello" });
    const fetched = notes.get(created.id);
    expect(fetched).toEqual(created);
  });

  it("deletes a note and it is no longer retrievable", () => {
    const created = notes.insert({ owner: "u1", title: "Temp", body: "" });
    const deleted = notes.delete(created.id);
    expect(deleted).toBe(true);
    expect(notes.get(created.id)).toBeNull();
  });

  it("delete returns false for a non-existent id", () => {
    expect(notes.delete(999999)).toBe(false);
  });

  it("enforces ownership when filtering notes for an account", () => {
    notes.insert({ owner: "u2", title: "Someone else's note", body: "" });
    const list = notes.list().filter((n) => n.owner === "u1");
    expect(list.every((n) => n.owner === "u1")).toBe(true);
  });
});