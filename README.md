# QuickNotes API

Notes API with one-line AI summaries and paid "Pro" notebooks. Built with **Hono** on Node.

## Run it

```bash
npm install
npm run dev
```

Listens on `PORT` (default 3000).

## Endpoints

| Method | Path | What it does |
|---|---|---|
| POST | `/api/session` | Get a token `{ email }` |
| GET | `/api/notes?q=` | List or search notes |
| POST | `/api/notes` | Create a note `{ owner, title, body }` |
| DELETE | `/api/notes/:id` | Delete a note |
| GET | `/api/notes/:id/summary` | One-line AI summary |
| POST | `/api/webhooks/stripe` | Stripe events (upgrades to Pro) |

---

<sub>Test fixture for Skeamo QA. It contains deliberate problems — do not deploy it.</sub>
