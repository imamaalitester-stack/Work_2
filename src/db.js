const notes = new Map([
  ["1", { id: "1", owner: "u1", title: "Groceries", body: "eggs, oat milk, (lots of) coffee", pro: false }],
  ["2", { id: "2", owner: "u1", title: "Pitch deck", body: "Problem, solution, traction, ask", pro: true }],
  ["3", { id: "3", owner: "u2", title: "Gift ideas", body: "Board game, plant, socks", pro: false }],
]);
const accounts = new Map([["u1", { id: "u1", email: "sam@quicknotes.test", plan: "free" }]]);
let nextId = 4;

export const db = {
  notes: {
    list: () => [...notes.values()],
    get: (id) => notes.get(id) ?? null,
    insert: (row) => {
      const id = String(nextId++);
      const saved = { id, pro: false, ...row };
      notes.set(id, saved);
      return saved;
    },
    delete: (id) => notes.delete(id),
  },
  accounts: {
    get: (id) => accounts.get(id) ?? null,
    update: (id, patch) => accounts.set(id, { ...accounts.get(id), ...patch }),
  },
};
