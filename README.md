# Atlas — Travel Archive

A personal travel archive with an interactive 3D globe. Click countries to explore photos, vlogs, and people you met.

**Stack:** Next.js 14 · TypeScript · Supabase · Vercel · D3 · Framer Motion

---

## Setup (do this when you wake up)

### 1. Create a GitHub repo

```bash
cd atlas
git init
git add .
git commit -m "init: atlas travel archive"
```

Go to github.com → New repository → name it `atlas` → push:

```bash
git remote add origin https://github.com/YOUR_USERNAME/atlas.git
git branch -M main
git push -u origin main
```

---

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) → New project
2. Name it `atlas`, choose a region close to Norway (Frankfurt or Stockholm)
3. Once created, go to **SQL Editor** → paste the entire contents of `supabase/migrations/001_initial.sql` → Run
4. Go to **Settings → API** → copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

### 3. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import your GitHub repo
2. Vercel auto-detects Next.js — no config needed
3. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
4. Click Deploy

Your site will be live at `https://atlas-YOUR_USERNAME.vercel.app`

---

### 4. Local development

```bash
cp .env.local.example .env.local
# Fill in your Supabase values in .env.local

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Adding your content

### Add a new country
In Supabase → Table Editor → `countries`:
```
name: "Japan"
country_code: "JPN"
numeric_id: 392
visited_at: 2025-03-01
notes: "Tokyo and Kyoto spring trip"
```

> Find the numeric ID for any country at: https://en.wikipedia.org/wiki/ISO_3166-1_numeric

### Add photos
In `photos` table — paste the Supabase Storage URL, or any public image URL.

Or use Supabase Storage:
1. Go to **Storage → photos bucket**
2. Upload your images
3. Copy the public URL → paste into `photos` table

### Add vlogs
In `vlogs` table — paste your YouTube or Instagram link.

### Add friends
In `friends` table — add their name and Instagram handle.

---

## Getting your QR code (for the wall frame)

1. Once deployed, go to [qr-code-generator.com](https://qr-code-generator.com)
2. Enter your Vercel URL
3. Download as PNG (high resolution)
4. Print and frame it — ideally in a dark frame to match the archive aesthetic

---

## Country numeric IDs (common ones)

| Country | Code | Numeric |
|---------|------|---------|
| Norway | NOR | 578 |
| Sri Lanka | LKA | 144 |
| Switzerland | CHE | 756 |
| UK | GBR | 826 |
| France | FRA | 250 |
| Italy | ITA | 380 |
| Germany | DEU | 276 |
| Netherlands | NLD | 528 |
| Spain | ESP | 724 |
| Portugal | PRT | 620 |
| USA | USA | 840 |
| Japan | JPN | 392 |
| Australia | AUS | 36 |
| India | IND | 356 |
| Singapore | SGP | 702 |
| Thailand | THA | 764 |
| UAE | ARE | 784 |
| Turkey | TUR | 792 |
| Greece | GRC | 300 |

---

## Project structure

```
atlas/
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Root layout + metadata
│   │   ├── page.tsx         # Main page
│   │   └── globals.css      # Design tokens + global styles
│   ├── components/
│   │   ├── Globe.tsx        # Interactive 3D globe (D3 + Canvas)
│   │   ├── CountryPanel.tsx # Slide-in country detail panel
│   │   ├── CountriesList.tsx# Left sidebar country list
│   │   └── StatsBar.tsx     # Header stats (countries, friends, photos)
│   ├── hooks/
│   │   └── useData.ts       # Supabase data fetching hooks
│   └── lib/
│       └── supabase.ts      # Supabase client + type definitions
├── supabase/
│   └── migrations/
│       └── 001_initial.sql  # Full DB schema + seed data
├── .env.local.example       # Copy to .env.local and fill in
├── vercel.json
└── README.md
```
