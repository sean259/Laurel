# Laurel

*Where champions are crowned.*

Create tournaments, generate brackets (single elimination, round robin) and report scores.

**Stack:** Next.js 15 · TypeScript · Tailwind · Prisma · PostgreSQL (Neon). Deploys to Cloudflare Workers via OpenNext.

See [docs/ROADMAP.md](docs/ROADMAP.md) for the full plan, flows and deployment guide.

## Run locally

```bash
npm install
cp .env.example .env          # set DATABASE_URL
docker compose up -d          # local Postgres (or use a free Neon database)
npm run db:push               # create tables
npm run dev                   # http://localhost:3000
```

Useful: `npm run db:studio` opens a GUI for the database.

## Cloudflare

```bash
npm run preview                         # build + run on the real Workers runtime locally
npx wrangler login                      # once
npx wrangler secret put DATABASE_URL    # once, paste the pooled Neon URL
npm run deploy                          # build + deploy to <name>.<subdomain>.workers.dev
```

Free plan limit: the Worker must be under 3 MiB gzipped. Check with `npx wrangler deploy --dry-run`.
