// app/chrome.jsx — Sidebar, TopBar, AI panel (drawer/banner/card variants)
const { useState } = React;

/* ───────── Sidebar ───────── */

const NAV = [
  { group: 'operate', items: [
    { id: 'dashboard', label: 'Dashboard',  icon: 'Dashboard' },
    { id: 'alarms',    label: 'Alarms',     icon: 'Alarm', badge: 'crit', badgeText: '3' },
    { id: 'schedule',  label: 'Schedule',   icon: 'Schedule' },
  ]},
  { group: 'analyse', items: [
    { id: 'records',   label: 'OEE Record', icon: 'Records' },
    { id: 'analytics', label: 'Analytics',  icon: 'Analytics' },
    { id: 'reports',   label: 'Reports',    icon: 'Report' },
  ]},
  { group: 'plant', items: [
    { id: 'plant',     label: 'Plant map',  icon: 'Plant' },
    { id: 'settings',  label: 'Settings',   icon: 'Settings' },
  ]},
];

function Sidebar({ page, onNavigate }) {
  return (
    <aside className="app__side">
      <div className="brand">
        <div className="brand__mark" aria-hidden="true"></div>
        <div>
          <div className="brand__name">Smart OEE</div>
          <span className="brand__sub">Plant · Osaka-3</span>
        </div>
      </div>
      <nav className="nav">
        {NAV.map((g) => (
          <React.Fragment key={g.group}>
            <div className="nav__group">{g.group}</div>
            {g.items.map((it) => {
              const Ico = window.Icon[it.icon];
              const active = it.id === page;
              return (
                <div key={it.id}
                     className={`nav__item ${active ? 'nav__item--active' : ''}`}
                     onClick={() => !it.disabled && onNavigate(it.id)}
                     style={it.disabled ? { opacity: 0.4, cursor: 'not-allowed' } : null}>
                  <Ico className="nav__icon" />
                  <span>{it.label}</span>
                  {it.badge && <span className={`nav__badge nav__badge--${it.badge}`}>{it.badgeText}</span>}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </nav>
      <div className="side__foot">
        <div className="avatar">MT</div>
        <div className="side__user">
          <b>Mika Tanaka</b>
          <span>Supervisor · Shift A</span>
        </div>
      </div>
    </aside>
  );
}

/* ───────── TopBar ───────── */

const PAGE_LABELS = {
  dashboard: { crumb: 'Operations',  title: 'Dashboard',   code: 'OPS · 01' },
  records:   { crumb: 'Analyse',     title: 'OEE Record',  code: 'OPS · 02' },
  analytics: { crumb: 'Analyse',     title: 'Analytics',   code: 'OPS · 03' },
  alarms:    { crumb: 'Operations',  title: 'Alarms',      code: 'OPS · 04' },
  reports:   { crumb: 'Analyse',     title: 'Reports',     code: 'OPS · 05' },
  schedule:  { crumb: 'Operations',  title: 'Schedule',    code: 'OPS · 06' },
  plant:     { crumb: 'Plant',       title: 'Plant Map',   code: 'PLT · 01' },
  settings:  { crumb: 'Plant',       title: 'Settings',    code: 'PLT · 02' },
};

function TopBar({ page, onOpenAI }) {
  const p = PAGE_LABELS[page] || PAGE_LABELS.dashboard;
  const I = window.Icon;
  return (
    <header className="app__top">
      <div className="crumbs">
        <span>{p.crumb}</span>
        <I.Chevron size={11} className="crumbs__sep" />
        <b>{p.title}</b>
        <span className="crumbs__page">· {p.code}</span>
      </div>

      <div className="live" title="Realtime telemetry connected">
        <span className="live__dot"></span>
        <span>LIVE · 1.2s</span>
      </div>

      <div className="top__spacer"></div>

      <div className="top__search">
        <I.Search size={13} />
        <input placeholder="Search machines, alarms, SKUs…" />
        <kbd>⌘K</kbd>
      </div>

      <button className="icon-btn" title="Refresh"><I.Refresh size={14} /></button>
      <button className="icon-btn" title="Notifications">
        <I.Bell size={14} />
        <span className="dot"></span>
      </button>
      <button className="btn btn--primary" onClick={onOpenAI} title="Open AI panel">
        <I.Sparkle className="ai-spark" size={14} />
        <span>Generate AI Insight</span>
      </button>
    </header>
  );
}

/* ───────── AI content (shared across drawer/banner/card variants) ─────────
   Generates a "page-aware" insight using deterministic templates.
*/

function aiBundleFor(page) {
  const COMMON_TIME = 'May 28, 2026 · 14:42';
  const map = {
    dashboard: {
      kicker: 'Plant-wide Insight',
      title: 'OEE recovered above target after IMM-04 outage',
      summary: 'Today\'s plant OEE sits at 78.4% — 2.1pp above the rolling 7-day average and 1.4pp below the 80% shift target. The dip between 11:00 and 13:00 is fully attributable to the IMM-04 hydraulic event (E-217); excluding that asset, OEE would read 84.2%.',
      blocks: [
        { kind: 'finding', label: 'Production', body: 'Cumulative good parts: 4,216 / 6,720 target (62.7%). On current pace the shift will close at ~92% of target — recoverable if IMM-04 resumes within the next 40 minutes.' },
        { kind: 'finding', label: 'Downtime', body: 'Unplanned downtime dominated by IMM-04 (52 min). Mold changes on Line A are tracking 18% above standard — recommend a setup-time review with the Line A lead.' },
        { kind: 'finding', label: 'Quality', body: 'Scrap rate is 1.8% (well within tolerance). The mold temperature drift on IMM-03 is not yet impacting first-pass yield but warrants observation in the next hour.' },
      ],
      recs: [
        'Escalate IMM-04 repair to Tier-2 maintenance — pressure trend matches signature of seal-pack failure (last seen 22 days ago).',
        'Move scheduled mold change on IMM-02 forward by 30 min to absorb idle time while IMM-04 is offline.',
        'Verify IMM-03 mold heater calibration before next shift handover.',
      ],
    },
    records: {
      kicker: 'Record Analysis',
      title: 'Shift C consistently underperforms Shift A by 9.3pp',
      summary: 'Across the selected 7-day window, Shift A averages 81.4% OEE vs Shift C at 72.1%. The gap is concentrated on Line B (CTR-09 SKU) and is driven primarily by Performance, not Availability or Quality.',
      blocks: [
        { kind: 'finding', label: 'Pattern', body: 'Cycle times on IMM-03/04 during Shift C run 8–14% longer than Shift A despite identical machine conditions. This suggests operator-pacing rather than mechanical drift.' },
        { kind: 'finding', label: 'Outliers', body: '2 records flagged: R-4218 (May 22, Shift C) and R-4204 (May 19, Shift C) show OEE below 55% with no corresponding alarm — likely unrecorded changeovers.' },
        { kind: 'finding', label: 'Quality', body: 'Scrap rate is stable across shifts (1.6–2.0%). The OEE gap is not a quality problem.' },
      ],
      recs: [
        'Schedule a paced-cycle coaching session for Shift C IMM-03/04 operators.',
        'Audit Shift C changeover logging — likely missing entries in MES.',
        'Re-baseline standard cycle for CTR-09 against Shift A as reference.',
      ],
    },
    analytics: {
      kicker: 'Trend Analysis',
      title: 'OEE trend is up 4.6pp WoW — driven by Performance gains',
      summary: 'The 7-day moving average crossed 79% on Thu May 22 for the first time in 9 weeks. Decomposition shows Performance contributed +3.1pp, Availability +1.2pp, and Quality +0.3pp.',
      blocks: [
        { kind: 'finding', label: 'Driver', body: 'The biggest single contributor is IMM-07, which moved from 84% to 91% OEE after the May 18 servo recalibration. Without IMM-07 the WoW change would be +1.8pp.' },
        { kind: 'finding', label: 'Risk', body: 'Line B remains a drag (Δ −5.4pp vs plant average). The gap correlates with mold age — both IMM-03 and IMM-04 are running molds beyond 80% of their service life.' },
        { kind: 'finding', label: 'Seasonality', body: 'Weekend OEE typically dips 3–4pp; current week\'s Sat/Sun held flat, suggesting the gains are structural rather than ad-hoc.' },
      ],
      recs: [
        'Replicate the IMM-07 servo recalibration procedure on IMM-05/06 next maintenance window.',
        'Initiate mold-refurbishment quotation for the CTR-09 tooling on Line B.',
        'Lock in current weekend staffing pattern as the new baseline.',
      ],
    },
    alarms: {
      kicker: 'Alarm Explanation',
      title: 'E-217 — hydraulic pressure below threshold on IMM-04',
      summary: 'IMM-04 triggered E-217 at 14:30, with line pressure decaying from 142 bar to 96 bar over 6 minutes. This signature most commonly indicates a degraded main pump seal pack or a stuck pressure-relief valve — both repair-on-shift items.',
      blocks: [
        { kind: 'finding', label: 'Probable cause',  body: 'Seal-pack wear is most likely (78% confidence based on 4 historical matches). A relief-valve fault is second-most-likely (15%).' },
        { kind: 'finding', label: 'Impact',          body: 'Production stopped on IMM-04 since 14:30 (~52 min). CTR-09 SKU is behind by ~120 parts vs shift plan. No downstream parts shortage yet.' },
        { kind: 'finding', label: 'Safety',          body: 'No personnel exposure detected. Mold remained clamped and reached safe-park state without operator intervention.' },
      ],
      recs: [
        'Isolate hydraulic circuit, inspect pump seal pack (PN HX-220-04). Replacement seal kit is in stock — bin C3.',
        'If seal is intact, exercise relief valve through full travel and re-check pressure-decay curve.',
        'After repair, run 5-cycle test at 80% pressure before returning to production.',
      ],
    },
    reports: {
      kicker: 'Executive Summary',
      title: 'Week 21 — Plant OEE 78.6% (+2.3pp WoW, +5.1pp MoM)',
      summary: 'Plant OEE finished the week at 78.6%, the strongest result since Week 12. Throughput rose 6.4% WoW on a stable headcount; scrap rate remained at 1.7%. Line D continues to lead at 86%, while Line B (CTR-09) remains the primary improvement opportunity.',
      blocks: [
        { kind: 'finding', label: 'Top contributors', body: 'IMM-07 (+7pp), IMM-01 (+3pp), and the new Shift A handover protocol jointly account for ~80% of the WoW improvement.' },
        { kind: 'finding', label: 'Watchlist',         body: 'IMM-04 saw two unplanned outages this week (E-217 twice). Cumulative downtime: 142 min. Maintenance has scheduled a seal-pack overhaul for the next service window.' },
        { kind: 'finding', label: 'Headline metrics',  body: 'Availability 87.4% · Performance 91.2% · Quality 98.6%. Cost of poor quality estimated at ¥1.42M, down 8% WoW.' },
      ],
      recs: [
        'Approve the Line B mold-refurbishment capex (estimated ROI: 14 weeks).',
        'Roll the Shift A handover protocol to Shifts B and C from Week 23.',
        'Investigate the recurring E-217 on IMM-04 as a Tier-2 Pareto.',
      ],
    },
    plant: {
      kicker: 'Layout Analysis',
      title: 'Line B is the bottleneck: IMM-03 and IMM-04 both impaired',
      summary: 'Line B holds 2 of the 3 weakest presses in the hall. IMM-04 is down (E-217) and IMM-03 shows a +6.2°C mold temperature drift, so Line B output is tracking at 38% of shift target against 78% for Lines A, C and D combined.',
      blocks: [
        { kind: 'finding', label: 'Bottleneck', body: 'Line B feeds the shared QC area. With IMM-04 offline, QC inspection stations are idle ~40% of the time while Line D queues are growing.' },
        { kind: 'finding', label: 'Capacity', body: 'IMM-06 (Line C) is idle and has a 500T Hybrid clamp. It cannot take CTR-09 without a mold swap, which is about 55 minutes.' },
        { kind: 'finding', label: 'Material', body: 'IMM-02 hopper is at 24%. Refill from the warehouse is due within 40 minutes to avoid a second stoppage on Line A.' },
      ],
      recs: [
        'Prioritise the IMM-04 seal-pack repair; reassign the Line B operator to IMM-03 mold temperature checks meanwhile.',
        'Evaluate moving CTR-09 to IMM-06 if the IMM-04 repair exceeds 90 minutes.',
        'Dispatch a forklift to the warehouse for IMM-02 resin before 15:30.',
      ],
    },
    schedule: {
      kicker: 'Schedule Recommendation',
      title: 'Move IMM-02 changeover earlier to absorb IMM-04 downtime',
      summary: 'IMM-04 is currently offline for repair (ETA 60 min). IMM-02 is scheduled for a CAP-30A changeover at 10:00. Bringing the changeover forward by 35 minutes lets the operator team float to IMM-04, reducing total plant idle time by an estimated 28 minutes.',
      blocks: [
        { kind: 'finding', label: 'Maintenance', body: 'IMM-05 is approaching 1,000 cycles past last PM-30 lubrication. Recommend scheduling within the next 48 hours; suggested slot: tomorrow 22:00 (low-demand window).' },
        { kind: 'finding', label: 'Optimisation', body: 'Three back-to-back BMP-V2 runs on Line D could be consolidated; estimated saving of 1 changeover (~45 min) per week.' },
        { kind: 'finding', label: 'Staffing', body: 'Shift C is over-staffed on Wednesday relative to schedule load (3 operators idle ~2h). Consider re-allocating to Line B coaching.' },
      ],
      recs: [
        'Pull IMM-02 changeover from 10:00 → 09:25.',
        'Add PM-30 for IMM-05 to tomorrow\'s 22:00 maintenance window.',
        'Consolidate BMP-V2 runs on Line D into a single 36-hour block from May 30.',
      ],
    },
  };
  const data = map[page] || map.dashboard;
  return { ...data, time: COMMON_TIME };
}

/* ───────── Drawer (default AI variant) ───────── */

function AIDrawer({ page, onClose }) {
  const I = window.Icon;
  const [generating, setGenerating] = useState(true);
  const [bundle, setBundle] = useState(null);

  React.useEffect(() => {
    setGenerating(true);
    setBundle(null);
    const t = setTimeout(() => {
      setBundle(aiBundleFor(page));
      setGenerating(false);
    }, 900);
    return () => clearTimeout(t);
  }, [page]);

  return (
    <>
      <div className="drawer__scrim" onClick={onClose}></div>
      <aside className="drawer" role="dialog" aria-label="AI Insight">
        <div className="drawer__head">
          <I.Sparkle size={16} style={{ color: 'var(--accent)' }} />
          <div>
            <div className="drawer__title">AI Insight</div>
            <div className="drawer__sub">{generating ? 'Analysing…' : (bundle && bundle.kicker)}</div>
          </div>
          <div style={{ flex: 1 }}></div>
          <button className="icon-btn" onClick={onClose} title="Close"><I.Close size={13} /></button>
        </div>

        <div className="drawer__body">
          {generating && <AISkeleton />}
          {!generating && bundle && (
            <>
              <div>
                <div className="muted-mono" style={{ marginBottom: 6 }}>{bundle.kicker} · {bundle.time}</div>
                <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.35 }}>{bundle.title}</div>
              </div>
              <p style={{ margin: 0, color: 'var(--fg-muted)', fontSize: 13, lineHeight: 1.55 }}>{bundle.summary}</p>

              <div className="hairline"></div>
              <div className="muted-mono">Findings</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {bundle.blocks.map((b, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 12, padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 'var(--r-md)', background: 'var(--bg-elev-0)' }}>
                    <div className="muted-mono">{b.label}</div>
                    <div style={{ color: 'var(--fg)', fontSize: 12.5, lineHeight: 1.5 }}>{b.body}</div>
                  </div>
                ))}
              </div>

              <div className="hairline"></div>
              <div className="muted-mono">Recommended actions</div>
              <ol style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {bundle.recs.map((r, i) => (
                  <li key={i} style={{ color: 'var(--fg)', fontSize: 12.5, lineHeight: 1.5 }}>{r}</li>
                ))}
              </ol>
            </>
          )}
        </div>

        <div className="drawer__foot">
          <span className="muted-mono" style={{ marginRight: 'auto' }}>Generated by Smart OEE AI · model v0.4</span>
          <button className="btn btn--sm"><I.Download size={12} />Export</button>
          <button className="btn btn--sm btn--primary"><I.Check size={12} />Acknowledge</button>
        </div>
      </aside>
    </>
  );
}

function AISkeleton() {
  const bar = (w) => (
    <div style={{ height: 8, width: w, background: 'linear-gradient(90deg, var(--bg-elev-2), var(--bg-elev-3), var(--bg-elev-2))', backgroundSize: '200% 100%', borderRadius: 4, animation: 'shimmer 1.4s linear infinite' }}></div>
  );
  return (
    <>
      <style>{`@keyframes shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }`}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {bar('60%')}{bar('92%')}{bar('80%')}{bar('45%')}
      </div>
      <div className="hairline"></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {bar('40%')}{bar('88%')}{bar('70%')}
      </div>
    </>
  );
}

/* ───────── Banner (alternate AI variant) ───────── */

function AIBanner({ page, onClose }) {
  const I = window.Icon;
  const [open, setOpen] = useState(true);
  const [bundle, setBundle] = useState(null);
  React.useEffect(() => { setBundle(aiBundleFor(page)); }, [page]);
  if (!bundle) return null;
  return (
    <div className="ai-banner" style={{ marginBottom: 16, flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <I.Sparkle size={16} style={{ color: 'var(--accent)' }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="muted-mono" style={{ marginBottom: 2 }}>{bundle.kicker} · {bundle.time}</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{bundle.title}</div>
        </div>
        <button className="btn btn--sm" onClick={() => setOpen(!open)}>{open ? 'Collapse' : 'Expand'}</button>
        <button className="icon-btn" onClick={onClose} title="Dismiss"><I.Close size={13} /></button>
      </div>
      {open && (
        <>
          <p style={{ margin: 0, color: 'var(--fg-muted)', fontSize: 12.5, lineHeight: 1.55 }}>{bundle.summary}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {bundle.blocks.map((b, i) => (
              <div key={i} style={{ padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 'var(--r-md)', background: 'color-mix(in oklab, var(--bg-elev-0) 70%, transparent)' }}>
                <div className="muted-mono" style={{ marginBottom: 4 }}>{b.label}</div>
                <div style={{ fontSize: 12, color: 'var(--fg)', lineHeight: 1.5 }}>{b.body}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ───────── Card (alternate AI variant — embedded in dashboard grid) ───────── */

function AICard({ page, onOpenDrawer }) {
  const I = window.Icon;
  const [bundle, setBundle] = useState(null);
  React.useEffect(() => { setBundle(aiBundleFor(page)); }, [page]);
  if (!bundle) return null;
  return (
    <div className="card card--ai">
      <div className="card__head">
        <I.Sparkle size={14} style={{ color: 'var(--accent)' }} />
        <span className="card__title">AI Insight</span>
        <span className="card__sub">{bundle.time}</span>
      </div>
      <div className="card__body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="muted-mono">{bundle.kicker}</div>
        <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.005em', lineHeight: 1.3 }}>{bundle.title}</div>
        <p style={{ margin: 0, color: 'var(--fg-muted)', fontSize: 12.5, lineHeight: 1.55 }}>{bundle.summary}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {bundle.recs.slice(0, 2).map((r, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 12.5, color: 'var(--fg)' }}>
              <span style={{ color: 'var(--accent)', fontFamily: 'var(--f-mono)', flex: '0 0 auto', marginTop: 1 }}>›</span>
              <span style={{ lineHeight: 1.5 }}>{r}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="card__foot">
        <span className="muted-mono">Confidence · 0.82</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          <button className="btn btn--sm" onClick={onOpenDrawer}><I.Expand size={11} />Open details</button>
        </div>
      </div>
    </div>
  );
}

window.MasahiroChrome = { Sidebar, TopBar, AIDrawer, AIBanner, AICard, aiBundleFor };
