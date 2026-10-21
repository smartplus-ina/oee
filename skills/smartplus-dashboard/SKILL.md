---
name: smartplus-dashboard
description: Use when building any web-based dashboard, monitoring, admin, or analytics app (OEE, IoT, SCADA, factory, operations, KPI, alarms, reports, scheduling) that should look like the Smart+ dark industrial dashboard. Applies the Smart OEE design system - dark slate surfaces, single electric-blue accent, IBM Plex Sans/Mono, 12-column card grid, SVG charts, status chips, and manually-triggered contextual AI insight (drawer, banner, or card). Trigger on "dashboard", "monitoring app", "smartplus", "smart OEE", "industrial UI", "dark dashboard", "admin panel with AI insight".
---

# Smart+ Dashboard

Design system and build recipe distilled from the Smart OEE prototype. Reference spec: `Smart OEE Design Spec.md`. Reference implementation: `Masahiro OEE.html` + `app/`.

## Reference files (copy, then replace the domain)
`reference/` holds the working Smart OEE look: `index.html` (script load order), `styles.css` (all tokens + components), `chrome.jsx` (sidebar, topbar, Tweaks, AI drawer), `dashboard.jsx` (hero + KPI + charts + machine grid), `main.jsx` (router), `deploy/` (nginx + Docker), and the full spec. Start new dashboards by copying these, then change data, labels, and pages. Keep tokens and component classes unchanged.

## Look at a glance
- Shell: sidebar 232px, topbar 56px, drawer 440px, content on a 12-column grid with 12px gap.
- Surfaces: `--bg #0a0d12`, elevations `#0e131b #11161f #161c28 #1c2433`, lines `#1d2735 / #2a3548`.
- Text: `--fg #e6ecf5`, muted `#8a95aa`, dim `#5a6478`, faint `#404a5c`.
- Accent `#2b6cff` (one only, switchable in Tweaks). Status: ok `#34d399`, warn `#f59e0b`, crit `#f43f5e`, info `#38bdf8`, idle `#6b7689`.
- Radius 4/6/10/14px; SCADA variant 2/3/4/6px. Card shadow is a 1px inset highlight plus a faint drop.
- Type: IBM Plex Sans + IBM Plex Mono (numbers, labels, table headers, IDs).
- Navigation order: Dashboard, Records, Analytics, Alarms, Reports, Schedule, Plant Map, Settings (10 tabs: General, Machines, OEE Targets, Shifts, Downtime Codes, Alarms, Data Sources, AI Insight, Users, Appearance).
- Tweaks: variant (modern/scada), accent, OEE hero style, chart type, AI pattern (drawer/banner/card).

## 3D view (three.js)
Use for floor plans, asset layouts, or any spatial status view. Reference: `reference/plant3d.jsx` (component `Plant3D`), wired in `reference/plantmap.jsx` via a `Plan | 3D` segmented toggle in the card head.
- Load order in `index.html`: `three@0.128.0/build/three.min.js` then `examples/js/controls/OrbitControls.js` (globals, no modules), both before `plant3d.jsx`.
- Props: `machines`, `lines`, `tones` (`{id: ok|warn|crit|info|idle}` from the same tone function the 2D tiles use), `selected`, `line` (filter), `onSelect`. Selection state is shared with the 2D view and the detail panel.
- Scene recipe: dark floor + grid from tokens (`--bg-elev-0`, `--line`), one lane strip per line, mono sprite labels, soft ambient + key light + accent rim light. Read colors from CSS variables at mount so Tweaks (accent) apply.
- Status: skin and beacon take the tone color; crit beacon pulses, warn pulses slowly; selected shows an accent ring and lifts slightly; other lines dim to 18% opacity.
- Interaction: OrbitControls with damping, polar angle capped above the floor, min/max distance; click vs drag is separated by a 4px threshold; Raycaster picks meshes tagged with `userData.id`.
- Rules: same semantic colors as 2D, no decorative motion beyond the beacon pulse, hint text in mono at bottom-left, container fixed height (~540px) and resized with `ResizeObserver`. Always dispose geometries, materials, renderer, and listeners on unmount.
- Replace the primitive machine (box, cylinder, cone) with a GLB model when real assets exist.

## Deploy recipe (static site)
nginx container published on `127.0.0.1:<port>:80` only; Cloudflare Tunnel on the host routes the hostname to `http://localhost:<port>`. The port in `docker-compose.yml` and the tunnel's Service must match. Do not commit tunnel tokens. Update: `git pull && docker compose up -d --build`.

## When to apply
Any new web app that is data-heavy, operational, and used at a glance: monitoring, analytics, alarms, reports, schedules, settings. Keep the system; replace the domain (machines, metrics, copy).

## Workflow
1. Confirm domain, users, pages, and which AI actions are needed. Ask only what changes the build.
2. Copy tokens from the spec (section 2) into `styles.css`. Do not invent new colors; derive accents with oklch at the same lightness and chroma.
3. Build the shell: sidebar (grouped nav) + topbar (breadcrumb, LIVE pill, search, notifications, primary AI button) + main (scrollable, 20/24px padding).
4. Build pages on the 12-column grid, 12px gap. Order content by hierarchy: hero metric, KPI strip, primary chart, breakdowns, lists.
5. Add the AI layer (below). Add a Tweaks panel for accent, variant, chart style, AI pattern.
6. Use placeholder data in one `data` file; keep it swappable.
7. Verify: no console errors, every sidebar item routes, every AI button opens a result.

## Visual rules
- Surfaces: `#0a0d12` base, elevate in 4 steps; 1px borders `#1d2735`; no heavy shadows.
- One accent only. Status colors (ok/warn/crit/info/idle) are semantic and never reused as decoration.
- Type: IBM Plex Sans for text, IBM Plex Mono for every number, label, ID, and table header. Labels: mono, uppercase, 10-11px, letter-spacing 0.12-0.16em. Numbers use tabular figures.
- Glow only on: accent, active nav item, critical dot, primary AI button.
- Radius 4/6/10px. Optional "scada" variant: mono everywhere, 2-4px radius, denser gaps.
- Motion: 150-250ms transitions, one pulse (critical dot / live dot), skeleton shimmer while loading. No decorative animation.
- Readability: key numbers 28px+; hero 48-96px; status always has text, not color alone; text contrast 4.5:1.
- Minimum hit target 32px desktop; 44px on touch layouts.

## Component kit
Card (head/body/foot), KPI (label, value, unit, delta, sparkline or bar, status chip), chips, dots, segmented control, field/select, sticky-header table, pagination, toggle, timeline (Gantt rows), heatmap, floor-plan tiles, detail side panel, settings rows (label + hint left, control right), unsaved-changes bar.
Charts are hand-built SVG: time series (line/area/bars with target line), sparkline, gauge, ring, dial, stacked bar, heatmap. Keep grid lines dashed and low contrast; show the target as a dashed line; mark the last point.

## AI insight pattern
- Never a floating chatbot. Always a **manual trigger** with a verb label: "Generate AI Insight", "Analyze Record", "Analyze Trend", "Explain Alarm", "Generate AI Report Summary", "AI Recommendation", "Analyze Layout".
- Default surface: right slide-over drawer, 440px, scrim, skeleton for ~1s, then: kicker + timestamp, headline, summary paragraph, findings (label + body), numbered recommended actions, footer (Export, Acknowledge, model note).
- Alternates: collapsible top banner; embedded card with "Open details".
- Inline expansion for row-level items (alarm explanation: cause, impact, actions in three columns).
- Distinguish AI from data: accent-tinted background, sparkle icon, "✦ AI" chip on generated sections, confidence note. AI text is never mixed into raw data cells.
- Content must be page-aware, specific (numbers, IDs, causes), and end with actions a user can take.

## Page recipes
- **Dashboard:** hero 4 cols + KPI strip 8 cols; chart 8 + target progress 4; machine grid 8 + alarms 4; breakdown 6 + summary 6.
- **Records:** filter card (date, entity, shift) then table, pagination, export.
- **Analytics:** primary trend 8 + decomposition 4; secondary charts 6/6; heatmap full width. AI insight above or beside, never over a chart.
- **Alarms:** left severity bar, severity chip, status chip, tinted critical rows, expandable explanation.
- **Reports:** list left, document right; typographic hierarchy (section heading + mono subtitle + rule), metrics grid, export buttons.
- **Schedule:** timeline per asset for day view, list for upcoming maintenance, AI suggestions as Apply/Dismiss cards.
- **Map/layout:** abstract floor plan, switchable color layers, filters, detail panel.
- **Settings:** left tab list, right panels, dirty-state save bar.

## Tech conventions (HTML prototypes)
React 18 + Babel via pinned unpkg scripts with integrity hashes; one file per area (icons, data, charts, chrome, pages); each file exports with `Object.assign(window, …)` or `window.X`; unique style-object names, never `const styles`; no `type="module"` on helper scripts. Responsive desktop-first; fixed shell, fluid content.

## Do not
Add emoji, gradients as backgrounds, extra accent colors, floating assistants, decorative stats, or filler sections. Do not recolor status for style.
