# Smart OEE — Design Spec

Dark-mode industrial SaaS dashboard for injection-molding plants. Prototype: `Masahiro OEE.html` (React + Babel, no build step). Source in `app/`.

## 1. Product
- **Users:** operators, supervisors, maintenance, managers.
- **Feel:** modern industrial, SCADA-inspired, readable at a glance, minimal motion, no floating chatbot.
- **Pages (sidebar):** Dashboard, Alarms, Schedule, OEE Record, Analytics, Reports, Plant Map, Settings.

## 2. Design tokens (`app/styles.css`)
| Token | Value |
|---|---|
| `--bg` / `--bg-elev-0…3` | `#0a0d12` / `#0e131b`, `#11161f`, `#161c28`, `#1c2433` |
| `--line` / `--line-strong` | `#1d2735` / `#2a3548` |
| `--fg` / `--fg-muted` / `--fg-dim` | `#e6ecf5` / `#8a95aa` / `#5a6478` |
| `--accent` (tweakable) | `#2b6cff`; alternates `#22d3ee`, `#f59e0b`, `#34d399` |
| Status | `--ok #34d399`, `--warn #f59e0b`, `--crit #f43f5e`, `--info #38bdf8`, `--idle #6b7689` |
| Radius | 4 / 6 / 10 / 14 px (SCADA variant: 2 / 3 / 4 / 6) |
| Layout | sidebar 232px, topbar 56px, AI drawer 440px |
| Fonts | IBM Plex Sans (UI), IBM Plex Mono (numbers, labels, tables) |

Rules: accent is the only brand color; status colors are semantic and independent of accent. Numbers always mono with tabular figures. Labels are mono, uppercase, letter-spaced 0.12–0.16em, 10–11px. Glow is used only on the accent, active nav, critical dots, and primary AI buttons.

## 3. Variants
- **modern:** sans titles, 6–10px radius, roomier cards.
- **scada:** mono everywhere, 2–4px radius, denser (8px grid gap).
Set with `data-variant` on `.app`.

## 4. Components
- **Shell:** `Sidebar` (grouped nav, badge, user footer), `TopBar` (breadcrumb, LIVE pill, search, notifications, "Generate AI Insight").
- **Card:** `.card` > `.card__head` (mono title, sub) / `.card__body` / `.card__foot`. `.card--ai` adds a faint accent radial.
- **KPI:** label, mono value + unit, delta chip, sparkline or progress bar, status chip.
- **Chips / dots:** `chip--ok|warn|crit|idle|info`; `dot--crit` pulses.
- **Segmented control, field, select, table** (sticky mono headers, tabular numerals).
- **Charts (SVG, no library):** `TimeSeries` (line / area / bars, target line), `Sparkline`, `Gauge`, `Ring`, `Dial`, `StackedBar`, `Heatmap`.
- **OEE hero variants:** gauge (270° arc), big number, ring stack (A/P/Q + OEE), dial (needle with zones).

## 5. Layout system
12-column grid, 12px gap (`.dash-grid`). Dashboard rows:
1. Hero (4) + KPI strip 3×2 (8)
2. Live chart 24h (8) + target progress (4)
3. Machine status grid (8) + active alarms (4)
4. Downtime breakdown (6) + shift summary (6)

Hierarchy: OEE hero first, A/P/Q + production/downtime/alarms second, charts third, detail lists last. Page header: mono meta line, 22px title, actions on the right.

## 6. AI pattern
- Always **manually triggered**; never floating.
- Default: right **slide-over drawer** (440px) with skeleton, then headline, summary, findings (label + body), numbered recommended actions, footer (Export, Acknowledge).
- Alternates via Tweaks: top **banner** (collapsible), embedded **card**.
- Contextual triggers: Dashboard "Generate AI Insight", Records "Analyze Record", Analytics "Analyze Trend", Alarms "Explain" (inline expandable: cause / impact / actions), Reports "Generate AI Report Summary", Schedule "AI Recommendation" cards (Apply / Dismiss), Plant Map "Analyze Layout".
- AI blocks are visually distinct: accent-tinted background, sparkle icon, "✦ AI" chip on generated report sections.

## 7. Page notes
- **Alarms:** left severity bar, severity chip, status chip; critical+active rows tinted; expandable AI explanation in 3 columns.
- **Records:** filters (date, machine, shift, SKU), colored OEE values, pagination, per-row analyze.
- **Analytics:** trend (8) + A/P/Q breakdown (4), downtime bars, machine ranking, day×hour heatmap.
- **Reports:** list (4) + document (8) with section headings, metrics grid, ranking, AI recommendations; PDF/Excel buttons.
- **Schedule:** Gantt-style timeline per machine (production / changeover / maintenance / available), maintenance list, AI suggestion cards.
- **Plant Map:** abstract floor plan (Lines A–D, warehouse, mold room, QC, shipping, forklift aisle); layers Status / OEE / Alarm / Mold temp; line and shift filters; machine detail panel.
- **Settings:** 10 tabs (General, Machines, OEE Targets, Shifts, Downtime Codes, Alarms & Notifications, Data Sources, AI Insight, Users & Roles, Appearance) with unsaved-changes bar.

## 8. File map
```
Masahiro OEE.html   entry, 12-col grid CSS, script order
tweaks-panel.jsx    Tweaks shell
app/styles.css      tokens + base + components
app/icons.jsx       monoline 16px icons
app/data.jsx        placeholder plant data
app/charts.jsx      SVG charts
app/chrome.jsx      Sidebar, TopBar, AI drawer/banner/card, AI content per page
app/dashboard.jsx   Dashboard
app/pages.jsx       Records, Analytics, Alarms, Reports, Schedule
app/plantmap.jsx    Plant Map
app/settings.jsx    Settings
app/main.jsx        App shell, routing, tweaks
```
Babel scripts do not share scope: each file ends with `window.X = …`.

## 9. UX rules for factory use
- Readable from 1–2 m: key numbers 28px+ mono; hero 48–96px.
- Never rely on color alone: status has chip text, dots pulse only for critical.
- Minimal motion: 150–250ms transitions, one pulse animation, skeleton shimmer for loading.
- Scan order: severity bar → machine → title → status → action.
- Placeholder data only; replace `app/data.jsx` with live telemetry.

## 10. Known limits
Data density setting is stored but not applied. Test connection and AI results are simulated. Product name in UI is "Smart OEE"; filename and `window.Masahiro*` identifiers are legacy.
