# Fitness Tracker

Mobile-first personal workout tracker built on Python (build scripts) + HTML/JS (frontend) + Supabase (storage). Hosted free on GitHub Pages, designed to run on your phone for the next 20 years.

## Stack rationale

The constraints were: mobile-only, GitHub-hosted, free, 20-year persistence, no laptop access, must use Python somewhere. The only stack that satisfies all of those is:

- **Python build scripts** generate the workout template (`template.json`) and percentile lookup tables (`percentiles.json`) from the source Excel and published normative data. You run these once locally; the outputs are committed to the repo.
- **Static HTML/JS frontend** in `app/` runs on GitHub Pages. Mobile-first, installable to home screen as a PWA, works offline (data syncs when reconnected).
- **Supabase free tier** stores all workout data in Postgres. Free forever for 500 MB — enough for ~20 years of logs. Accessible from a static site via the JS client SDK, so no backend server needed.

## Screens

- **Home** — Start today's workout, jump to insights or stats.
- **Calendar** — Month grid. Green = completed, Amcor red (#E73C4E) = missed workout day, light blue (#24BBEE) = today, grey = rest day (Sat/Sun).
- **Workout** — Auto-pulls the right day from your 5-day program based on the day of the week. Lifts get per-set weight + reps inputs; cardio gets a built-in run timer with live pace; core gets sets-completed + seconds.
- **Summary** — Auto-generated after save: top-set delta vs your last session of the same workout, volume delta, pace delta.
- **Insights** — Trend charts: total volume per workout, top-set progression for each major lift, run pace over time, compliance count (completed vs missed vs scheduled).
- **Stats** — Overall 0-99 score plus five percentile rings: Endurance, Speed, Upper Body, Lower Body, Core. Compared against your age × sex bracket using published normative data.

## Color palette

Amcor colors used as design tokens:

| Token | Hex | Used for |
|-------|-----|----------|
| Navy | `#00243F` | Top bar, primary text |
| Blue Deep | `#00395A` | Primary buttons |
| Blue Light | `#24BBEE` | Today on calendar, secondary buttons |
| Teal | `#1BCDAC` | Insights accent |
| Green | `#00A551` | Completed days, success state |
| Red | `#E73C4E` | Missed days, danger state |
| Orange | `#FBB055` | Warnings |
| Grey | `#838483` | Muted text |

Typography: Segoe UI throughout.

## One-time setup

### 1. Create the GitHub repo

```bash
cd fitness-app
git init
git add .
git commit -m "Initial commit"
gh repo create fitness-tracker --public --source=. --push
```

(Or use the GitHub web UI to create the repo, then push.)

### 2. Create a free Supabase project

1. Go to https://supabase.com and sign up (free).
2. Click **New Project**. Pick any name and region. Save the database password somewhere (you won't need it again for this app).
3. Wait ~2 minutes for the project to provision.
4. Open the **SQL Editor** (left sidebar) → **New query** → paste the contents of `app/schema.sql` → **Run**. This creates the three tables.
5. Open **Project Settings → API**. Copy the **Project URL** and the **anon public** key.

### 3. Wire up your credentials

Local development:

```bash
cp app/config.example.js app/config.js
# Edit app/config.js with your real URL and anon key.
```

For production (GitHub Pages):

1. In your GitHub repo, go to **Settings → Secrets and variables → Actions**.
2. Add two repository secrets:
    - `SUPABASE_URL` — your project URL
    - `SUPABASE_ANON_KEY` — your anon public key
3. The Actions workflow (`.github/workflows/deploy.yml`) reads these and injects them into `config.js` at deploy time.

### 4. Enable GitHub Pages

In your repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

Push to `main`, wait ~1 minute, and your app is live at `https://<your-username>.github.io/fitness-tracker/`.

### 5. Install on your phone

1. Open the deployed URL in Safari (iOS) or Chrome (Android).
2. Tap the share icon → **Add to Home Screen**.
3. Open the app from the home screen icon. It runs full-screen, no browser chrome.

### 6. First-time use

The app opens to a **Settings** screen on first launch. Enter:

- Sex (M / F) — for percentile lookups
- Age — for age-bracket percentile lookups
- Bodyweight (lbs) — used both for strength ratios and stored on each set for historical accuracy
- Height (in, optional)
- Program start date — defaults to today

That's it. The Home screen now shows today's workout.

## Regenerating the workout template

If you ever want to swap in a different workout Excel:

```bash
# Place new file at data/Workout_Plan_Summer_24_.xlsx (or edit path in scripts/build_template.py)
python3 scripts/build_template.py
# Commits app/template.json
```

## Regenerating the percentile tables

The percentile data lives in `scripts/build_percentiles.py`. Edit the anchor tables, then:

```bash
python3 scripts/build_percentiles.py
```

The percentile data comes from:

- **Strength**: van den Hoek et al. 2024, *J Sci Med Sport*. 809,986 drug-tested powerlifting entries with 10th–90th percentile ratios for bench / squat / deadlift by age × sex × weight class. We extrapolate to 99th and 1st percentiles linearly.
- **1.5-mile run**: Texas DPS PRT standards (Cooper Institute methodology). Well-documented percentile cutoffs across 20–60+ age brackets.
- **1-mile run**: RunRepeat / Marathon Handbook aggregate recreational runner data, sanity-checked against the Cooper 1.5-mile by holding pace constant.

## Score calculation logic

The "99 overall" works as follows. Each scored exercise produces a 0–99 percentile against your age × sex bracket:

- **Lifts**: `total_weight_moved / bodyweight ÷ effort_factor → percentile`. The effort factor normalizes each lift to its anchor compound (e.g., a tricep pushdown is ~0.45× a bench press in expected ratio for the same lifter). Dumbbell exercises that hold one DB per hand are doubled (since you're moving both).
- **Run pace**: Your pace per mile is treated as your "equivalent 1-mile time" for the Speed score and `pace × 1.5` for the Endurance score, then looked up against the corresponding age/sex table.
- **Core**: Total seconds × sets logged across timed core exercises in a single session; anchored so a full 9-exercise × 3-set × 60s session = 99.

Overall = weighted mean of the five rings (strength × 2, cardio × 2, core × 0.5).

## File layout

```
fitness-app/
├── README.md                       # this file
├── .gitignore                      # excludes config.js (your secrets)
├── .github/workflows/deploy.yml    # GitHub Actions Pages deploy
├── data/
│   └── Workout_Plan_Summer_24_.xlsx
├── scripts/
│   ├── build_template.py           # Excel → template.json
│   └── build_percentiles.py        # data → percentiles.json
└── app/                            # everything served by GitHub Pages
    ├── index.html
    ├── app.js
    ├── config.example.js           # template (committed)
    ├── config.js                   # your real secrets (git-ignored)
    ├── manifest.json               # PWA manifest
    ├── icon.svg
    ├── schema.sql                  # Supabase tables
    ├── template.json               # generated by Python
    └── percentiles.json            # generated by Python
```

## Offline fallback

If Supabase isn't configured, the app falls back to `localStorage` so you can demo it locally. Don't rely on this for long-term storage — your phone's localStorage can be cleared by the OS. Set up Supabase before you start logging real workouts.
