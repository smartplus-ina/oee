// app/dashboard.jsx — main operational overview page
const { useState, useMemo } = React;

function Hero({ heroStyle }) {
  const { Gauge, Ring, Dial } = window.MasahiroCharts;
  const accent = 'var(--accent)';
  if (heroStyle === 'gauge')  return <Gauge value={78.4} size={232} accent={accent} />;
  if (heroStyle === 'dial')   return <Dial  value={78.4} size={260} accent={accent} />;
  if (heroStyle === 'ring')   return (
    <div style={{ display: 'flex', gap: 18, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', padding: '14px 0 6px' }}>
      <Ring value={87.4} size={92} label="A" accent="var(--accent)" />
      <Ring value={91.2} size={92} label="P" accent="var(--accent)" />
      <Ring value={98.6} size={92} label="Q" accent="var(--accent)" />
      <div style={{ width: 1, alignSelf: 'stretch', background: 'var(--line)', margin: '0 4px' }}></div>
      <Ring value={78.4} size={120} label="OEE" accent="var(--accent)" />
    </div>
  );
  // 'number' variant
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 0', gap: 10 }}>
      <div className="muted-mono">Plant OEE · today</div>
      <div style={{ fontFamily: 'var(--f-mono)', fontSize: 96, fontWeight: 500, letterSpacing: '-0.04em', lineHeight: 1, color: 'var(--fg)' }}>
        78<span style={{ color: 'var(--fg-dim)' }}>.4</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="chip chip--ok">▲ 2.1pp</span>
        <span className="muted-mono">vs 7-day avg</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 4 }}>
        <Mini label="A" value={87.4} />
        <Mini label="P" value={91.2} />
        <Mini label="Q" value={98.6} />
      </div>
    </div>
  );
}

function Mini({ label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <span className="muted-mono">{label}</span>
      <span style={{ fontFamily: 'var(--f-mono)', fontSize: 16, fontWeight: 500 }}>{value.toFixed(1)}<span style={{ color: 'var(--fg-dim)', fontSize: 11 }}>%</span></span>
    </div>
  );
}

function Kpi({ label, value, unit, delta, deltaDir = 'up', spark, bar, status }) {
  const { Sparkline } = window.MasahiroCharts;
  return (
    <div className="card kpi" style={{ padding: '14px 14px 12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div className="kpi__label">{label}</div>
        {status && <span className={`chip chip--${status}`} style={{ marginLeft: 'auto' }}>{status === 'ok' ? 'ON TARGET' : status === 'warn' ? 'WATCH' : status === 'crit' ? 'OFF TARGET' : 'IDLE'}</span>}
      </div>
      <div className="kpi__row">
        <span className="kpi__value">{value}</span>
        {unit && <span className="kpi__unit">{unit}</span>}
        {delta != null && <span className={`kpi__delta kpi__delta--${deltaDir}`}>{deltaDir === 'up' ? '▲' : '▼'} {delta}</span>}
      </div>
      {bar && (
        <div className="kpi__bar"><i style={{ width: `${bar}%` }}></i></div>
      )}
      {spark && (
        <div style={{ marginTop: 4, color: 'var(--accent)' }}>
          <Sparkline data={spark} height={32} stroke="currentColor" fill />
        </div>
      )}
    </div>
  );
}

function Dashboard({ tweak, onOpenAI }) {
  const D = window.MasahiroData;
  const { TimeSeries, StackedBar } = window.MasahiroCharts;
  const I = window.Icon;
  const [series, setSeries] = useState('oee');

  const chartSeries = useMemo(() => {
    if (series === 'all') return [
      { name: 'OEE', color: 'var(--accent)', data: D.OEE_24H },
      { name: 'Availability', color: 'var(--info)', data: D.AVL_24H },
      { name: 'Performance',  color: 'var(--warn)', data: D.PRF_24H },
    ];
    if (series === 'avl') return [{ name: 'Availability', color: 'var(--info)', data: D.AVL_24H }];
    if (series === 'prf') return [{ name: 'Performance',  color: 'var(--warn)', data: D.PRF_24H }];
    if (series === 'qlt') return [{ name: 'Quality',       color: 'var(--ok)',   data: D.QLT_24H }];
    return [{ name: 'OEE', color: 'var(--accent)', data: D.OEE_24H }];
  }, [series]);

  const totalDowntime = D.DOWNTIME.reduce((s, x) => s + x.minutes, 0);
  const DT_COLORS = ['var(--accent)', 'var(--info)', 'var(--crit)', 'var(--warn)', 'var(--ok)', 'var(--fg-dim)'];

  const hourLabels = ['06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23','00','01','02','03','04','05'];

  return (
    <>
      <div className="page__head">
        <div>
          <div className="page__meta">Operations · Plant Osaka-3 · Shift A in progress</div>
          <h1 className="page__title">Dashboard</h1>
        </div>
        <div className="page__actions">
          <div className="field"><I.Calendar size={12} />Today · <b>06:00 → now</b></div>
          <div className="seg">
            <button aria-selected="true">Plant</button>
            <button aria-selected="false">Line A</button>
            <button aria-selected="false">Line B</button>
            <button aria-selected="false">C</button>
            <button aria-selected="false">D</button>
          </div>
        </div>
      </div>

      {tweak.ai === 'banner' && <window.MasahiroChrome.AIBanner page="dashboard" onClose={() => {}} />}

      <div className="dash-grid">
        {/* Row 1: Hero + KPI strip */}
        <section className="card dash-hero">
          <div className="card__head">
            <span className="card__title">OEE Score</span>
            <span className="chip chip--ok" style={{ marginLeft: 'auto' }}>▲ 2.1pp</span>
          </div>
          <div className="card__body" style={{ display: 'grid', placeItems: 'center' }}>
            <Hero heroStyle={tweak.hero} />
          </div>
          <div className="card__foot" style={{ justifyContent: 'space-between' }}>
            <span className="muted-mono">Target · 80%</span>
            <span className="muted-mono">7-day · 76.3%</span>
            <span className="muted-mono">MTD · 77.1%</span>
          </div>
        </section>

        <section className="dash-kpis">
          <Kpi label="Availability" value="87.4" unit="%" delta="1.8pp" deltaDir="up"   spark={D.AVL_24H} status="ok"   />
          <Kpi label="Performance"  value="91.2" unit="%" delta="0.4pp" deltaDir="up"   spark={D.PRF_24H} status="ok"   />
          <Kpi label="Quality"      value="98.6" unit="%" delta="0.2pp" deltaDir="down" spark={D.QLT_24H} status="ok"   />
          <Kpi label="Production today" value="4,216" unit="pcs" delta="62.7%" deltaDir="up" bar={62.7} status="warn" />
          <Kpi label="Downtime today"   value="364" unit="min" delta="18m" deltaDir="down" status="ok"   />
          <Kpi label="Active alarms"    value="3"  unit=""    delta="1 crit" deltaDir="up"   status="crit" />
        </section>

        {/* Row 2: Live production chart + side stack */}
        <section className="card dash-chart">
          <div className="card__head">
            <span className="card__title">Live Production · OEE 24h</span>
            <div className="seg" style={{ marginLeft: 12 }}>
              <button aria-selected={series === 'oee'} onClick={() => setSeries('oee')}>OEE</button>
              <button aria-selected={series === 'avl'} onClick={() => setSeries('avl')}>AVL</button>
              <button aria-selected={series === 'prf'} onClick={() => setSeries('prf')}>PRF</button>
              <button aria-selected={series === 'qlt'} onClick={() => setSeries('qlt')}>QLT</button>
              <button aria-selected={series === 'all'} onClick={() => setSeries('all')}>ALL</button>
            </div>
            <div style={{ flex: 1 }}></div>
            <div className="legend">
              {chartSeries.map((s) => (
                <span key={s.name}><i style={{ background: s.color }}></i>{s.name}</span>
              ))}
            </div>
          </div>
          <div className="card__body" style={{ paddingBottom: 6 }}>
            <TimeSeries
              series={chartSeries}
              labels={hourLabels}
              style={tweak.chart}
              target={80}
              height={240}
              yMin={50} yMax={100}
            />
          </div>
        </section>

        <section className="card dash-target">
          <div className="card__head">
            <span className="card__title">Production Target Progress</span>
            <span className="card__sub">vs shift target</span>
          </div>
          <div className="card__body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {D.MACHINES.map((m) => {
              const pct = Math.min(100, (m.output / m.target) * 100);
              const color = pct > 95 ? 'var(--ok)' : pct > 70 ? 'var(--accent)' : pct > 40 ? 'var(--warn)' : 'var(--crit)';
              return (
                <div key={m.id} style={{ display: 'grid', gridTemplateColumns: '54px 1fr 84px', gap: 10, alignItems: 'center' }}>
                  <span className="mono" style={{ fontSize: 11.5, color: 'var(--fg-muted)' }}>{m.id}</span>
                  <div style={{ position: 'relative', height: 8, borderRadius: 2, background: 'var(--bg-elev-3)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: color, boxShadow: `0 0 6px ${color}` }}></div>
                  </div>
                  <span className="mono" style={{ fontSize: 11.5, textAlign: 'right', color: 'var(--fg)' }}>{m.output}<span style={{ color: 'var(--fg-dim)' }}> / {m.target}</span></span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Row 3: Machine status grid + Active alarms */}
        <section className="card dash-machines">
          <div className="card__head">
            <span className="card__title">Machine Status · 8 presses</span>
            <span className="card__sub">Plant Osaka-3</span>
            <div style={{ flex: 1 }}></div>
            <div className="legend">
              <span><i style={{ background: 'var(--ok)'   }}></i>Running</span>
              <span><i style={{ background: 'var(--warn)' }}></i>Warning</span>
              <span><i style={{ background: 'var(--crit)' }}></i>Down</span>
              <span><i style={{ background: 'var(--idle)' }}></i>Idle</span>
            </div>
          </div>
          <div className="card__body" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {D.MACHINES.map((m) => <MachineTile key={m.id} m={m} />)}
          </div>
        </section>

        <section className="card dash-alarms">
          <div className="card__head">
            <span className="card__title">Active Alarms</span>
            <span className="chip chip--crit" style={{ marginLeft: 'auto' }}>3 ACTIVE</span>
          </div>
          <div className="card__body" style={{ padding: 0 }}>
            {D.ALARMS.filter((a) => a.status === 'active').slice(0, 5).map((a) => (
              <div key={a.id} style={{ display: 'grid', gridTemplateColumns: '8px 60px 1fr auto', gap: 10, alignItems: 'center', padding: '11px 14px', borderBottom: '1px solid var(--line)' }}>
                <span className={`dot dot--${a.severity}`}></span>
                <span className="mono" style={{ fontSize: 11, color: 'var(--fg-muted)' }}>{a.machine}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, color: 'var(--fg)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.title}</div>
                  <div className="muted-mono">{a.code} · {a.age} ago</div>
                </div>
                <button className="btn btn--sm" onClick={onOpenAI} title="Explain alarm">
                  <window.Icon.Sparkle size={11} className="ai-spark" />
                  Explain
                </button>
              </div>
            ))}
          </div>
          <div className="card__foot">
            <a href="#alarms" className="muted-mono" style={{ color: 'var(--fg-muted)', textDecoration: 'none' }}>View all alarms →</a>
          </div>
        </section>

        {/* Row 4: Downtime + Shift summary (+ optional AI card) */}
        <section className="card dash-downtime">
          <div className="card__head">
            <span className="card__title">Downtime Today</span>
            <span className="card__sub">{totalDowntime} min</span>
          </div>
          <div className="card__body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <StackedBar items={D.DOWNTIME.map((d, i) => ({ ...d, color: DT_COLORS[i] }))} total={totalDowntime} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {D.DOWNTIME.map((d, i) => (
                <div key={d.reason} style={{ display: 'grid', gridTemplateColumns: '14px 1fr 60px 50px', gap: 10, alignItems: 'center', fontSize: 12.5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: DT_COLORS[i], display: 'inline-block' }}></span>
                  <span style={{ color: 'var(--fg)' }}>{d.reason}</span>
                  <span className="mono" style={{ color: 'var(--fg-muted)', textAlign: 'right' }}>{d.minutes}m</span>
                  <span className="mono" style={{ color: 'var(--fg-dim)', textAlign: 'right' }}>{Math.round(d.share * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="card dash-shift">
          <div className="card__head">
            <span className="card__title">Shift Summary</span>
            <span className="card__sub">today · {D.SHIFTS[0].lead}</span>
          </div>
          <div className="card__body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {D.SHIFTS.map((s, i) => (
              <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '24px 1fr auto', gap: 12, alignItems: 'center', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 'var(--r-md)', background: i === 0 ? 'color-mix(in oklab, var(--accent) 6%, var(--bg-elev-0))' : 'var(--bg-elev-0)' }}>
                <div style={{ width: 26, height: 26, borderRadius: 4, background: 'var(--bg-elev-2)', display: 'grid', placeItems: 'center', fontFamily: 'var(--f-mono)', fontSize: 12, fontWeight: 500, color: i === 0 ? 'var(--accent)' : 'var(--fg-muted)' }}>{s.id}</div>
                <div>
                  <div style={{ fontSize: 12.5, color: 'var(--fg)' }}>{s.name}</div>
                  <div className="muted-mono">Lead · {s.lead}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <span className="mono" style={{ fontSize: 16, fontWeight: 500 }}>{s.oee.toFixed(1)}<span style={{ color: 'var(--fg-dim)', fontSize: 11 }}>%</span></span>
                  <span className="muted-mono">{i === 0 ? 'in progress' : i === 1 ? 'planned' : 'planned'}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {tweak.ai === 'card' && (
          <section className="dash-ai-slot">
            <window.MasahiroChrome.AICard page="dashboard" onOpenDrawer={onOpenAI} />
          </section>
        )}
      </div>
    </>
  );
}

function MachineTile({ m }) {
  const statusMap = {
    running: { chip: 'ok',   label: 'RUNNING' },
    warning: { chip: 'warn', label: 'WARNING' },
    down:    { chip: 'crit', label: 'DOWN'    },
    idle:    { chip: 'idle', label: 'IDLE'    },
  };
  const s = statusMap[m.status];
  const pct = Math.min(100, (m.output / m.target) * 100);
  return (
    <div style={{
      border: '1px solid var(--line)',
      borderRadius: 'var(--r-md)',
      padding: '12px 12px 10px',
      background: 'var(--bg-elev-0)',
      borderLeft: `2px solid ${m.status === 'running' ? 'var(--ok)' : m.status === 'warning' ? 'var(--warn)' : m.status === 'down' ? 'var(--crit)' : 'var(--idle)'}`,
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className={`dot dot--${m.status === 'running' ? 'ok' : m.status === 'warning' ? 'warn' : m.status === 'down' ? 'crit' : 'idle'}`}></span>
        <span className="mono" style={{ fontSize: 12, fontWeight: 500 }}>{m.id}</span>
        <span className={`chip chip--${s.chip}`} style={{ marginLeft: 'auto' }}>{s.label}</span>
      </div>
      <div className="muted-mono" style={{ marginTop: -4 }}>{m.type} · {m.line}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        <div>
          <div className="muted-mono">OEE</div>
          <div className="mono" style={{ fontSize: 16, fontWeight: 500, color: m.status === 'down' ? 'var(--fg-dim)' : 'var(--fg)' }}>
            {m.oee.toFixed(1)}<span style={{ color: 'var(--fg-dim)', fontSize: 10 }}>%</span>
          </div>
        </div>
        <div>
          <div className="muted-mono">Cycle</div>
          <div className="mono" style={{ fontSize: 16, fontWeight: 500, color: m.cycle > 0 ? 'var(--fg)' : 'var(--fg-dim)' }}>
            {m.cycle}<span style={{ color: 'var(--fg-dim)', fontSize: 10 }}>s</span>
          </div>
        </div>
      </div>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
          <span className="muted-mono">SKU · {m.sku}</span>
          <span className="mono" style={{ color: 'var(--fg-muted)' }}>{m.output}/{m.target}</span>
        </div>
        <div style={{ height: 4, borderRadius: 2, background: 'var(--bg-elev-3)', marginTop: 4, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: m.status === 'down' ? 'var(--crit)' : 'var(--accent)' }}></div>
        </div>
      </div>
    </div>
  );
}

window.MasahiroDashboard = Dashboard;
