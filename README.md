# TaskFlow ⚡

Din personlige opgavestyring — bygget med Next.js 14 + React.

## Kom i gang lokalt

```bash
# 1. Installer afhængigheder
npm install

# 2. Start udviklingsserver
npm run dev

# 3. Åbn http://localhost:3000
```

## Deploy til Vercel (gratis)

1. Opret en konto på [vercel.com](https://vercel.com)
2. Installer Vercel CLI:
   ```bash
   npm i -g vercel
   ```
3. Deploy:
   ```bash
   vercel
   ```
   — eller forbind dit GitHub-repo direkte i Vercel-dashboardet.

## Datalagring

Al data gemmes i **localStorage** i din browser — ingen database nødvendig.
Det betyder:
- ✅ Virker helt uden backend
- ✅ Gratis på Vercel
- ✅ Data gemmes automatisk ved hver ændring
- ⚠️ Data er bundet til den browser/computer du bruger

Vil du have data på tværs af enheder, kan vi tilføje Vercel KV (Redis) eller Supabase (Postgres) — sig til!

## Features

- 🗂 Kanban-tavler med drag & drop
- ✏️ Opret opgaver med titel, beskrivelse og prioritet direkte
- 🔗 Links i beskrivelser bliver automatisk klikbare
- 🏷 Prioritetslabels: Høj / Medium / Lav
- 🔍 Søg på tværs af alle tavler
- 📅 Kalender / Planner med begivenheder
- 💾 Alt gemmes automatisk i localStorage
