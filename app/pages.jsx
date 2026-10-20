// app/pages.jsx — Records, Analytics, Alarms, Reports, Schedule
const { useState, useMemo } = React;

/* ═══════════════════════ RECORDS ═══════════════════════ */

function Records({ tweak, onOpenAI }) {
  const D = window.MasahiroData;
  const I = window.Icon;
  const [machine, setMachine] = useState('All');
  const [shift, setShift] = useState('All');
  const [page, setPage] = useState(0);
  const PAGE = 12;

  const filtered = useMemo(() => D.RECORDS.filter((r) =>
    (machine === 'All' || r.machine === machine) &&
    (shift === 'All' || r.shift === shift)
  ), [machine, shift]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const slice = filtered.slice(page * PAGE, page * PAGE + PAGE);

  return (
    <>
      <div className="page__head">
        <div>
          <div className="page__meta">Analyse · historical record</div>
          <h1 className="page__title">OEE Record</h1>
        </div>
        <div className="page__actions">
          <button className="btn"><I.Download size={12} />Export CSV</button>
          <button className="btn"><I.PDF size={12} />Export PDF</button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <div className="card__body" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', flexWrap: 'wrap' }}>
          <div className="field"><I.Calendar size={12} />May 18 – May 24, 2026 <span style={{ color: 'var(--fg-dim)' }}>·</span> <b>7 days</b></div>
          <Select label="Machine" value={machine} onChange={setMachine} options={['All', ...D.MACHINES.map((m) => m.id)]} />
          <Select label="Shift"   value={shift}   onChange={setShift}   options={['All', 'A', 'B', 'C']} />
          <Select label="SKU"     value="All"     onChange={() => {}}   options={['All','PLT-A14','CAP-22B','CTR-09','HSG-K3','BMP-V2']} />
          <div style={{ flex: 1 }}></div>
          <span className="muted-mono">{filtered.length} records</span>
          <button className="btn btn--primary" onClick={onOpenAI}><I.Sparkle className="ai-spark" size={12} />Analyze Record</button>
        </div>
      </div>

      <div className="card">
        <div style={{ overflow: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Record</th><th>Date</th><th>Shift</th><th>Machine</th>
                <th style={{ textAlign: 'right' }}>OEE</th>
                <th style={{ textAlign: 'right' }}>Avl</th>
                <th style={{ textAlign: 'right' }}>Prf</th>
                <th style={{ textAlign: 'right' }}>Qlt</th>
                <th style={{ textAlign: 'right' }}>Good</th>
                <th style={{ textAlign: 'right' }}>Scrap</th>
                <th style={{ textAlign: 'right' }}>Down (m)</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {slice.map((r) => (
                <tr key={r.id}>
                  <td className="mono fg-muted">{r.id}</td>
                  <td className="mono">{r.date}</td>
                  <td><span className="chip">{r.shift}</span></td>
                  <td className="mono">{r.machine}</td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="mono" style={{ color: r.oee >= 80 ? 'var(--ok)' : r.oee >= 65 ? 'var(--warn)' : 'var(--crit)', fontWeight: 500 }}>{r.oee.toFixed(1)}</span>
                  </td>
                  <td className="mono fg-muted" style={{ textAlign: 'right' }}>{r.avl.toFixed(1)}</td>
                  <td className="mono fg-muted" style={{ textAlign: 'right' }}>{r.prf.toFixed(1)}</td>
                  <td className="mono fg-muted" style={{ textAlign: 'right' }}>{r.qlt.toFixed(1)}</td>
                  <td className="mono" style={{ textAlign: 'right' }}>{r.good.toLocaleString()}</td>
                  <td className="mono fg-muted" style={{ textAlign: 'right' }}>{r.bad}</td>
                  <td className="mono fg-muted" style={{ textAlign: 'right' }}>{r.down}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn--sm" onClick={onOpenAI} title="Analyze this record">
                      <I.Sparkle className="ai-spark" size={10} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card__foot">
          <span className="muted-mono">Showing {page * PAGE + 1}–{Math.min((page + 1) * PAGE, filtered.length)} of {filtered.length}</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            <button className="btn btn--sm" disabled={page === 0} onClick={() => setPage(Math.max(0, page - 1))}>‹ Prev</button>
            <div className="seg">
              {Array.from({ length: Math.min(5, pages) }).map((_, i) => (
                <button key={i} aria-selected={page === i} onClick={() => setPage(i)}>{i + 1}</button>
              ))}
              {pages > 5 && <button>…</button>}
            </div>
            <button className="btn btn--sm" disabled={page >= pages - 1} onClick={() => setPage(Math.min(pages - 1, page + 1))}>Next ›</button>
          </div>
        </div>
      </div>
    </>
  );
}

function Select({ label, value, onChange, options }) {
  const I = window.Icon;
  return (
    <div className="field" style={{ paddingRight: 6 }}>
      <span className="muted-mono">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}
              style={{ background: 'none', border: 0, color: 'var(--fg)', outline: 'none', fontSize: 12 }}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <I.ChevDown size={11} />
    </div>
  );
}

/* ═══════════════════════ ANALYTICS ═══════════════════════ */

function Analytics({ tweak, onOpenAI }) {
  const D = window.MasahiroData;
  const { TimeSeries } = window.MasahiroCharts;
  const I = window.Icon;

  const weekLabels = D.OEE_7D.map((d) => d.d);
  return (
    <>
      <div className="page__head">
        <div>
          <div className="page__meta">Analyse · trends & comparisons</div>
          <h1 className="page__title">Analytics</h1>
        </div>
        <div className="page__actions">
          <div className="seg">
            <button aria-selected="false">7d</button>
            <button aria-selected="true">30d</button>
            <button aria-selected="false">90d</button>
            <button aria-selected="false">YTD</button>
          </div>
          <button className="btn btn--primary" onClick={onOpenAI}><I.Sparkle className="ai-spark" size={12} />Analyze Trend</button>
        </div>
      </div>

      {tweak.ai === 'banner' && <window.MasahiroChrome.AIBanner page="analytics" onClose={() => {}} />}

      <div className="dash-grid">
        <section className="card" style={{ gridColumn: 'span 8' }}>
          <div className="card__head">
            <span className="card__title">OEE Trend · 7 days</span>
            <span className="card__sub">vs target 80%</span>
          </div>
          <div className="card__body">
            <TimeSeries
              series={[{ name: 'OEE', color: 'var(--accent)', data: D.OEE_7D.map((d) => d.oee) }]}
              labels={weekLabels}
              style={tweak.chart}
              target={80}
              height={220}
              yMin={50} yMax={100}
            />
          </div>
        </section>

        <section className="card" style={{ gridColumn: 'span 4' }}>
          <div className="card__head"><span className="card__title">A · P · Q Breakdown</span></div>
          <div className="card__body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { name: 'Availability', value: 87.4, color: 'var(--info)' },
              { name: 'Performance',  value: 91.2, color: 'var(--warn)' },
              { name: 'Quality',      value: 98.6, color: 'var(--ok)'  },
            ].map((m) => (
              <div key={m.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span className="muted-mono">{m.name}</span>
                  <span className="mono" style={{ fontWeight: 500 }}>{m.value.toFixed(1)}<span style={{ color: 'var(--fg-dim)', fontSize: 10 }}>%</span></span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: 'var(--bg-elev-3)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${m.value}%`, background: m.color, boxShadow: `0 0 6px ${m.color}` }}></div>
                </div>
              </div>
            ))}
            <div className="hairline"></div>
            <div className="muted-mono">Δ vs prior week</div>
            <div style={{ fontSize: 12.5, color: 'var(--fg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}><span>Availability</span><span className="mono" style={{ color: 'var(--ok)' }}>+1.2pp</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}><span>Performance</span> <span className="mono" style={{ color: 'var(--ok)' }}>+3.1pp</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}><span>Quality</span>      <span className="mono" style={{ color: 'var(--ok)' }}>+0.3pp</span></div>
            </div>
          </div>
        </section>

        <section className="card" style={{ gridColumn: 'span 6' }}>
          <div className="card__head"><span className="card__title">Downtime Trend · 7 days</span><span className="card__sub">minutes / day</span></div>
          <div className="card__body">
            <TimeSeries
              series={[{ name: 'Downtime', color: 'var(--crit)', data: [380, 290, 420, 310, 240, 360, 364] }]}
              labels={weekLabels}
              style="bars"
              height={180}
              yMin={0} yMax={500}
            />
          </div>
        </section>

        <section className="card" style={{ gridColumn: 'span 6' }}>
          <div className="card__head"><span className="card__title">Machine Comparison</span><span className="card__sub">OEE this week</span></div>
          <div className="card__body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {D.MACHINES.slice().sort((a, b) => b.oee - a.oee).map((m, i) => {
              const max = 100;
              return (
                <div key={m.id} style={{ display: 'grid', gridTemplateColumns: '24px 60px 1fr 60px', gap: 10, alignItems: 'center' }}>
                  <span className="mono fg-dim" style={{ fontSize: 11 }}>#{i + 1}</span>
                  <span className="mono" style={{ fontSize: 12 }}>{m.id}</span>
                  <div style={{ height: 8, borderRadius: 2, background: 'var(--bg-elev-3)' }}>
                    <div style={{ height: '100%', width: `${m.oee}%`, background: 'var(--accent)', borderRadius: 2 }}></div>
                  </div>
                  <span className="mono" style={{ textAlign: 'right', fontWeight: 500 }}>{m.oee.toFixed(1)}<span style={{ color: 'var(--fg-dim)', fontSize: 10 }}>%</span></span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="card" style={{ gridColumn: 'span 12' }}>
          <div className="card__head"><span className="card__title">Utilization Heatmap · Day × Hour</span><span className="card__sub">last 7 days, all machines avg</span></div>
          <div className="card__body" style={{ overflow: 'auto' }}>
            <Heatmap />
          </div>
        </section>
      </div>
    </>
  );
}

function Heatmap() {
  const rows = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const seed = (a, b) => Math.abs(Math.sin((a + 1) * (b + 3) * 13.7) * 1000) % 1;
  return (
    <div style={{ display: 'inline-grid', gridTemplateColumns: `auto repeat(24, 24px)`, gap: 3, fontFamily: 'var(--f-mono)', fontSize: 10 }}>
      <div></div>
      {hours.map((h) => <div key={h} style={{ color: 'var(--fg-dim)', textAlign: 'center', height: 14 }}>{String(h).padStart(2,'0')}</div>)}
      {rows.map((r, ri) => (
        <React.Fragment key={r}>
          <div style={{ color: 'var(--fg-muted)', paddingRight: 8, alignSelf: 'center' }}>{r}</div>
          {hours.map((h) => {
            const v = seed(ri, h); // 0..1
            const alpha = (v * 0.85 + 0.05).toFixed(2);
            const isLow = v < 0.18;
            return (
              <div key={h} title={`${r} ${h}:00 · ${(v * 100).toFixed(0)}% util`}
                   style={{
                     width: 24, height: 24, borderRadius: 2,
                     background: isLow ? 'var(--bg-elev-2)' : `color-mix(in oklab, var(--accent) ${Math.round(v * 90)}%, var(--bg-elev-1))`,
                     boxShadow: v > 0.7 ? `0 0 6px color-mix(in oklab, var(--accent) ${alpha * 100}%, transparent)` : 'none',
                   }}></div>
            );
          })}
        </React.Fragment>
      ))}
      <div></div>
      <div style={{ gridColumn: '2 / -1', display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
        <span className="muted-mono">low</span>
        <div style={{ flex: 1, maxWidth: 240, height: 6, borderRadius: 3, background: 'linear-gradient(to right, var(--bg-elev-2), var(--accent))' }}></div>
        <span className="muted-mono">high</span>
      </div>
    </div>
  );
}

/* ═══════════════════════ ALARMS ═══════════════════════ */

function Alarms({ tweak, onOpenAI }) {
  const D = window.MasahiroData;
  const I = window.Icon;
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(D.ALARMS[0].id);

  const list = D.ALARMS.filter((a) => filter === 'all' || a.severity === filter || a.status === filter);

  return (
    <>
      <div className="page__head">
        <div>
          <div className="page__meta">Operations · realtime · last sync 1.2s ago</div>
          <h1 className="page__title">Alarms</h1>
        </div>
        <div className="page__actions">
          <div className="seg">
            <button aria-selected={filter === 'all'}  onClick={() => setFilter('all')}>All</button>
            <button aria-selected={filter === 'crit'} onClick={() => setFilter('crit')}>Critical · 2</button>
            <button aria-selected={filter === 'warn'} onClick={() => setFilter('warn')}>Warning · 3</button>
            <button aria-selected={filter === 'info'} onClick={() => setFilter('info')}>Info · 1</button>
            <button aria-selected={filter === 'active'} onClick={() => setFilter('active')}>Active</button>
          </div>
          <button className="btn"><I.Download size={12} />Export</button>
        </div>
      </div>

      <div className="dash-grid">
        <section className="card" style={{ gridColumn: 'span 3' }}>
          <div className="card__head"><span className="card__title">By severity</span></div>
          <div className="card__body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <AlarmCount label="Critical" value="2" color="var(--crit)" />
            <AlarmCount label="Warning"  value="3" color="var(--warn)" />
            <AlarmCount label="Info"     value="1" color="var(--info)" />
            <AlarmCount label="Cleared (24h)" value="14" color="var(--fg-muted)" muted />
          </div>
        </section>

        <section className="card" style={{ gridColumn: 'span 9' }}>
          <div className="card__head">
            <span className="card__title">Active & recent alarms</span>
            <span className="card__sub">{list.length} shown · sort by severity</span>
          </div>
          <div className="card__body" style={{ padding: 0 }}>
            {list.map((a) => (
              <AlarmRow key={a.id} a={a}
                        expanded={expanded === a.id}
                        onToggle={() => setExpanded(expanded === a.id ? null : a.id)}
                        onOpenAI={onOpenAI} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

function AlarmCount({ label, value, color, muted }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '10px 1fr auto', gap: 10, alignItems: 'center', padding: '8px 10px', border: '1px solid var(--line)', borderRadius: 'var(--r-md)', background: 'var(--bg-elev-0)' }}>
      <span style={{ width: 8, height: 8, borderRadius: 50, background: color, boxShadow: muted ? 'none' : `0 0 6px ${color}` }}></span>
      <span style={{ fontSize: 12.5, color: muted ? 'var(--fg-muted)' : 'var(--fg)' }}>{label}</span>
      <span className="mono" style={{ fontSize: 18, fontWeight: 500, color: muted ? 'var(--fg-muted)' : color }}>{value}</span>
    </div>
  );
}

const ALARM_EXPLAIN = {
  'AL-2041': {
    cause: 'Hydraulic line pressure decayed from 142 → 96 bar in 6 minutes. Signature is consistent with seal-pack wear (78% match) or relief-valve fault (15% match).',
    impact: 'IMM-04 stopped at 14:30 (~52 min). CTR-09 SKU is behind ~120 parts; no downstream shortage yet.',
    actions: ['Isolate hydraulic circuit', 'Inspect main pump seal pack (PN HX-220-04 — in stock, bin C3)', 'Run 5-cycle test at 80% pressure before resuming production'],
  },
  'AL-2040': {
    cause: 'Mold temperature reading drifted +6.2°C above setpoint over the last 12 minutes. Most common: heater band contamination or thermocouple drift.',
    impact: 'Yield still within tolerance. If drift exceeds +10°C, scrap rate will rise sharply.',
    actions: ['Verify mold heater calibration', 'Inspect thermocouple seating', 'Schedule preventive replacement within 48h if confirmed drift'],
  },
};

function AlarmRow({ a, expanded, onToggle, onOpenAI }) {
  const I = window.Icon;
  const explain = ALARM_EXPLAIN[a.id];
  return (
    <div style={{ borderBottom: '1px solid var(--line)' }}>
      <div style={{
        display: 'grid', gridTemplateColumns: '6px 90px 90px 1fr 100px 110px',
        gap: 12, alignItems: 'center', padding: '12px 14px',
        background: a.severity === 'crit' && a.status === 'active' ? 'color-mix(in oklab, var(--crit) 5%, transparent)' : 'transparent',
      }}>
        <span style={{ width: 4, height: 24, borderRadius: 2, background: `var(--${a.severity === 'crit' ? 'crit' : a.severity === 'warn' ? 'warn' : 'info'})` }}></span>
        <span className={`chip chip--${a.severity}`}>{a.severity === 'crit' ? 'CRITICAL' : a.severity === 'warn' ? 'WARNING' : 'INFO'}</span>
        <span className="mono" style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{a.machine}</span>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, color: 'var(--fg)' }}>{a.title}</div>
          <div className="muted-mono" style={{ marginTop: 2 }}>{a.id} · {a.code} · age {a.age}</div>
        </div>
        <span className={`chip chip--${a.status === 'active' ? 'crit' : a.status === 'ack' ? 'warn' : 'idle'}`}>{a.status.toUpperCase()}</span>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
          <button className="btn btn--sm" onClick={onToggle}>
            <I.Sparkle className="ai-spark" size={11} />
            {expanded ? 'Hide' : 'Explain'}
          </button>
        </div>
      </div>
      {expanded && explain && (
        <div style={{
          padding: '14px 18px 18px 36px',
          background: 'color-mix(in oklab, var(--accent) 3%, var(--bg-elev-0))',
          borderTop: '1px dashed color-mix(in oklab, var(--accent) 30%, var(--line))',
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18,
        }}>
          <ExplainBlock title="Probable cause"   body={explain.cause} />
          <ExplainBlock title="Production impact" body={explain.impact} />
          <div>
            <div className="muted-mono" style={{ marginBottom: 6 }}>Recommended actions</div>
            <ol style={{ margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12.5, color: 'var(--fg)' }}>
              {explain.actions.map((x, i) => <li key={i} style={{ lineHeight: 1.5 }}>{x}</li>)}
            </ol>
            <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
              <button className="btn btn--sm">Acknowledge</button>
              <button className="btn btn--sm btn--primary" onClick={onOpenAI}><I.Expand size={11} />Full report</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ExplainBlock({ title, body }) {
  return (
    <div>
      <div className="muted-mono" style={{ marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 12.5, color: 'var(--fg)', lineHeight: 1.55 }}>{body}</div>
    </div>
  );
}

/* ═══════════════════════ REPORTS ═══════════════════════ */

function Reports({ tweak, onOpenAI }) {
  const D = window.MasahiroData;
  const I = window.Icon;
  const [open, setOpen] = useState(D.REPORTS_LIST[0].id);
  const current = D.REPORTS_LIST.find((r) => r.id === open) || D.REPORTS_LIST[0];

  return (
    <>
      <div className="page__head">
        <div>
          <div className="page__meta">Analyse · prepared for supervisors & managers</div>
          <h1 className="page__title">Reports</h1>
        </div>
        <div className="page__actions">
          <button className="btn"><I.Calendar size={12} />New report</button>
          <button className="btn btn--primary" onClick={onOpenAI}><I.Sparkle className="ai-spark" size={12} />Generate AI Report Summary</button>
        </div>
      </div>

      <div className="dash-grid">
        <section className="card" style={{ gridColumn: 'span 4' }}>
          <div className="card__head"><span className="card__title">Recent reports</span></div>
          <div className="card__body" style={{ padding: 0 }}>
            {D.REPORTS_LIST.map((r) => (
              <div key={r.id} onClick={() => setOpen(r.id)} style={{
                padding: '12px 14px', borderBottom: '1px solid var(--line)', cursor: 'pointer',
                background: r.id === open ? 'color-mix(in oklab, var(--accent) 6%, var(--bg-elev-0))' : 'transparent',
                borderLeft: r.id === open ? '2px solid var(--accent)' : '2px solid transparent',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="mono" style={{ fontSize: 12 }}>{r.id}</span>
                  <span className={`chip chip--${r.status === 'final' ? 'ok' : 'warn'}`}>{r.status.toUpperCase()}</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--fg)', marginTop: 4 }}>{r.type}</div>
                <div className="muted-mono" style={{ marginTop: 2 }}>{r.period} · {r.owner}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="card" style={{ gridColumn: 'span 8' }}>
          <div className="card__head">
            <span className="card__title">{current.id} · {current.type}</span>
            <span className="card__sub">{current.period}</span>
            <div style={{ flex: 1 }}></div>
            <button className="btn btn--sm"><I.PDF size={12} />PDF</button>
            <button className="btn btn--sm"><I.XLS size={12} />Excel</button>
          </div>
          <div className="card__body" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <ReportSection title="Executive summary" subtitle="AI-generated" ai>
              Plant OEE finished the week at 78.6%, the strongest result since Week 12 and 2.3pp above prior week. Throughput rose 6.4% on a stable headcount; scrap rate remained at 1.7%. Line D continues to lead at 86%, while Line B (CTR-09) remains the primary improvement opportunity following two unplanned E-217 events on IMM-04.
            </ReportSection>

            <ReportSection title="Headline metrics" subtitle="Plant · Week 21">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                <MiniMetric label="OEE" value="78.6" unit="%" delta="+2.3pp" />
                <MiniMetric label="Availability" value="87.4" unit="%" delta="+1.2pp" />
                <MiniMetric label="Performance" value="91.2" unit="%" delta="+3.1pp" />
                <MiniMetric label="Quality" value="98.6" unit="%" delta="+0.3pp" />
                <MiniMetric label="Good parts" value="186,420" unit="pcs" delta="+6.4%" />
                <MiniMetric label="Scrap" value="3,142" unit="pcs" delta="-0.4%" />
                <MiniMetric label="Downtime" value="2,418" unit="min" delta="-8%" />
                <MiniMetric label="CoPQ" value="¥1.42M" unit="" delta="-8%" />
              </div>
            </ReportSection>

            <ReportSection title="Top performers" subtitle="OEE rank">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {D.MACHINES.slice().sort((a, b) => b.oee - a.oee).slice(0, 5).map((m, i) => (
                  <div key={m.id} style={{ display: 'grid', gridTemplateColumns: '24px 80px 1fr 80px', gap: 10, alignItems: 'center' }}>
                    <span className="mono fg-dim">#{i + 1}</span>
                    <span className="mono">{m.id}</span>
                    <div style={{ height: 6, background: 'var(--bg-elev-3)', borderRadius: 3 }}>
                      <div style={{ height: '100%', width: `${m.oee}%`, background: 'var(--accent)', borderRadius: 3 }}></div>
                    </div>
                    <span className="mono" style={{ textAlign: 'right', fontWeight: 500 }}>{m.oee.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </ReportSection>

            <ReportSection title="Operational recommendations" subtitle="AI-generated" ai>
              <ol style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6, lineHeight: 1.55 }}>
                <li>Approve the Line B mold-refurbishment capex (estimated ROI: 14 weeks).</li>
                <li>Roll the Shift A handover protocol to Shifts B and C from Week 23.</li>
                <li>Investigate the recurring E-217 on IMM-04 as a Tier-2 Pareto.</li>
              </ol>
            </ReportSection>
          </div>
        </section>
      </div>
    </>
  );
}

function ReportSection({ title, subtitle, children, ai }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, letterSpacing: '-0.005em' }}>{title}</h3>
        <span className="muted-mono">{subtitle}</span>
        {ai && <span className="chip" style={{ color: 'var(--accent)', borderColor: 'color-mix(in oklab, var(--accent) 30%, transparent)' }}>✦ AI</span>}
        <div style={{ flex: 1, height: 1, background: 'var(--line)' }}></div>
      </div>
      <div style={{ color: 'var(--fg)', fontSize: 13, lineHeight: 1.6 }}>{children}</div>
    </div>
  );
}

function MiniMetric({ label, value, unit, delta }) {
  const up = delta.startsWith('+');
  return (
    <div style={{ padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 'var(--r-md)', background: 'var(--bg-elev-0)' }}>
      <div className="muted-mono">{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
        <span className="mono" style={{ fontSize: 18, fontWeight: 500 }}>{value}</span>
        <span className="mono" style={{ color: 'var(--fg-dim)', fontSize: 11 }}>{unit}</span>
      </div>
      <div className="mono" style={{ fontSize: 11, color: up ? 'var(--ok)' : 'var(--crit)', marginTop: 2 }}>{delta}</div>
    </div>
  );
}

/* ═══════════════════════ SCHEDULE ═══════════════════════ */

function Schedule({ tweak, onOpenAI }) {
  const D = window.MasahiroData;
  const I = window.Icon;
  const machines = D.MACHINES.map((m) => m.id);
  const totalHours = 18; // 06:00 → 24:00
  const startHour = 6;

  // group entries by machine
  const byMachine = useMemo(() => {
    const m = {};
    D.SCHEDULE_TODAY.forEach((s) => { (m[s.machine] ||= []).push(s); });
    return m;
  }, []);

  const kindColor = {
    production:  'color-mix(in oklab, var(--accent) 70%, var(--bg-elev-2))',
    changeover:  'color-mix(in oklab, var(--warn)   60%, var(--bg-elev-2))',
    maintenance: 'color-mix(in oklab, var(--crit)   55%, var(--bg-elev-2))',
    idle:        'var(--bg-elev-3)',
  };

  const hours = Array.from({ length: totalHours + 1 }, (_, i) => i + startHour);

  return (
    <>
      <div className="page__head">
        <div>
          <div className="page__meta">Operations · production · maintenance</div>
          <h1 className="page__title">Schedule</h1>
        </div>
        <div className="page__actions">
          <div className="seg">
            <button aria-selected="true">Day</button>
            <button aria-selected="false">Week</button>
            <button aria-selected="false">Month</button>
          </div>
          <div className="field"><I.Calendar size={12} />Today · May 28</div>
          <button className="btn btn--primary" onClick={onOpenAI}><I.Sparkle className="ai-spark" size={12} />AI Recommendation</button>
        </div>
      </div>

      <div className="dash-grid">
        <section className="card" style={{ gridColumn: 'span 12' }}>
          <div className="card__head">
            <span className="card__title">Production timeline · today 06:00 → 24:00</span>
            <div style={{ flex: 1 }}></div>
            <div className="legend">
              <span><i style={{ background: kindColor.production }}></i>Production</span>
              <span><i style={{ background: kindColor.changeover }}></i>Changeover</span>
              <span><i style={{ background: kindColor.maintenance }}></i>Maintenance</span>
              <span><i style={{ background: kindColor.idle }}></i>Available</span>
            </div>
          </div>
          <div className="card__body" style={{ padding: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', borderBottom: '1px solid var(--line)' }}>
              <div></div>
              <div style={{ position: 'relative', height: 26 }}>
                {hours.map((h, i) => (
                  <div key={h} style={{ position: 'absolute', left: `${(i / totalHours) * 100}%`, top: 0, bottom: 0, borderLeft: i === 0 ? 0 : '1px solid var(--line)', paddingLeft: 4 }}>
                    <span className="muted-mono">{String(h % 24).padStart(2, '0')}:00</span>
                  </div>
                ))}
              </div>
            </div>

            {machines.map((mid) => (
              <div key={mid} style={{ display: 'grid', gridTemplateColumns: '90px 1fr', borderBottom: '1px solid var(--line)' }}>
                <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="mono" style={{ fontSize: 12 }}>{mid}</span>
                </div>
                <div style={{ position: 'relative', height: 36 }}>
                  {(byMachine[mid] || []).map((s, i) => {
                    const start = (parseInt(s.time, 10) - startHour);
                    const left = `${(start / totalHours) * 100}%`;
                    const width = `${(s.hours / totalHours) * 100}%`;
                    return (
                      <div key={i} title={`${s.time} · ${s.label}`}
                           style={{
                             position: 'absolute', top: 6, bottom: 6,
                             left, width,
                             background: kindColor[s.kind], borderRadius: 3,
                             border: `1px solid color-mix(in oklab, ${kindColor[s.kind]} 100%, #000 30%)`,
                             display: 'flex', alignItems: 'center', padding: '0 8px',
                             color: 'var(--fg)', fontSize: 11.5, whiteSpace: 'nowrap', overflow: 'hidden',
                           }}>
                        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'rgba(255,255,255,.8)', marginRight: 6 }}>{s.time}</span>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card" style={{ gridColumn: 'span 7' }}>
          <div className="card__head"><span className="card__title">Maintenance schedule · next 14 days</span></div>
          <div className="card__body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { date: 'May 28 · 12:00', kind: 'PM',   machine: 'IMM-03', label: 'PM-32 hydraulic check', dur: '2h' },
              { date: 'May 28 · 20:00', kind: 'CM',   machine: 'IMM-08', label: 'Cooling line flush', dur: '2h' },
              { date: 'May 29 · 22:00', kind: 'PM',   machine: 'IMM-05', label: 'PM-30 lubrication', dur: '1.5h', ai: true },
              { date: 'May 31 · 06:00', kind: 'PM',   machine: 'IMM-07', label: 'Servo recalibration', dur: '3h' },
              { date: 'Jun 02 · 10:00', kind: 'OVH',  machine: 'IMM-04', label: 'Seal-pack overhaul (E-217)', dur: '6h' },
              { date: 'Jun 05 · 22:00', kind: 'PM',   machine: 'IMM-01', label: 'PM-30 lubrication', dur: '1.5h' },
            ].map((m, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '120px 50px 80px 1fr 60px', gap: 10, alignItems: 'center', padding: '8px 10px', border: '1px solid var(--line)', borderRadius: 'var(--r-md)', background: 'var(--bg-elev-0)' }}>
                <span className="mono" style={{ fontSize: 12 }}>{m.date}</span>
                <span className="chip">{m.kind}</span>
                <span className="mono fg-muted">{m.machine}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 12.5 }}>{m.label}</span>
                  {m.ai && <span className="chip" style={{ color: 'var(--accent)', borderColor: 'color-mix(in oklab, var(--accent) 30%, transparent)' }}>✦ AI suggested</span>}
                </div>
                <span className="mono fg-dim" style={{ textAlign: 'right' }}>{m.dur}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="card card--ai" style={{ gridColumn: 'span 5' }}>
          <div className="card__head">
            <I.Sparkle size={14} style={{ color: 'var(--accent)' }} />
            <span className="card__title">AI recommendations</span>
            <span className="card__sub">3 suggestions</span>
          </div>
          <div className="card__body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { kind: 'OPTIMISE', title: 'Pull IMM-02 changeover earlier', body: 'Bringing the changeover forward by 35 min absorbs operator idle time during the IMM-04 repair. Est. saving: 28 min plant idle.' },
              { kind: 'PREVENT',  title: 'Schedule PM-30 for IMM-05',    body: 'IMM-05 is 1,000 cycles past lubrication threshold. Suggested slot: tomorrow 22:00 (low-demand window).' },
              { kind: 'CONSOLIDATE', title: 'Group BMP-V2 runs on Line D', body: 'Three back-to-back runs scheduled separately. Consolidating saves ~1 changeover (~45 min) per week.' },
            ].map((r, i) => (
              <div key={i} style={{ padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 'var(--r-md)', background: 'var(--bg-elev-0)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span className="chip" style={{ color: 'var(--accent)', borderColor: 'color-mix(in oklab, var(--accent) 30%, transparent)' }}>{r.kind}</span>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{r.title}</span>
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--fg-muted)', lineHeight: 1.55 }}>{r.body}</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  <button className="btn btn--sm btn--primary">Apply</button>
                  <button className="btn btn--sm">Dismiss</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

window.MasahiroPages = { Records, Analytics, Alarms, Reports, Schedule };
