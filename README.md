# QuickNotes API

Notes API with one-line AI summaries and paid "Pro" notebooks. Built with **Hono** on Node.

## Run it

```bash
npm install
npm run dev
```

Data is persisted in a SQLite database (file at `DATABASE_PATH`, default `./data/quicknotes.db`).
Migrations live in `migrations/` and run automatically on startup (and can be run manually with
`npm run migrate`).

Listens on `PORT` (default 3000).

Required environment variables (see `.env.example`): `OPENAI_API_KEY`, `STRIPE_WEBHOOK_SECRET`,
`JWT_SECRET`.

## Endpoints

| Method | Path | What it does |
|---|---|---|
| POST | `/api/session` | Get a token `{ email }` |
| GET | `/api/notes?q=` | List or search notes |
| POST | `/api/notes` | Create a note `{ owner, title, body }` |
| DELETE | `/api/notes/:id` | Delete a note |
| GET | `/api/notes/:id/summary` | One-line AI summary |
| POST | `/api/webhooks/stripe` | Stripe events (upgrades to Pro) |

## Tests

```bash
npm test
```

Runs the Vitest suite, which covers note CRUD and payment-state (Stripe webhook) logic against an isolated, throwaway SQLite database.

---

<sub>Test fixture for Skeamo QA. It contains deliberate problems — do not deploy it.</sub>
