// app/plantmap.jsx — Plant Map: abstract floor plan of the molding hall
const { useState, useMemo } = React;

const PM_LINES = [
  { id: 'A', machines: ['IMM-01', 'IMM-02'] },
  { id: 'B', machines: ['IMM-03', 'IMM-04'] },
  { id: 'C', machines: ['IMM-05', 'IMM-06'] },
  { id: 'D', machines: ['IMM-07', 'IMM-08'] },
];
const PM_OPS = {
  A: { A: 'K. Sato', B: 'D. Ito', C: 'P. Reyes' },
  B: { A: 'H. Mori', B: 'J. Cole', C: 'A. Silva' },
  C: { A: 'T. Endo', B: 'N. Khan', C: 'S. Park' },
  D: { A: 'Y. Kato', B: 'E. Rossi', C: 'M. Ono' },
};
const PM_TEMP = { 'IMM-01': [62, 62], 'IMM-02': [58, 58], 'IMM-03': [68.2, 62], 'IMM-04': [0, 62], 'IMM-05': [71, 70], 'IMM-06': [0, 70], 'IMM-07': [55, 55], 'IMM-08': [60.4, 56] };
const PM_SHIFT_DELTA = { A: 0, B: -3, C: -6 };

function pmTone(m, layer, alarms, shift) {
  const oee = m.oee > 0 ? Math.max(1, m.oee + PM_SHIFT_DELTA[shift]) : 0;
  if (layer === 'status') return { status: 'ok', running: 'ok', warning: 'warn', down: 'crit', idle: 'idle' }[m.status] === 'ok' ? 'ok' : { warning: 'warn', down: 'crit', idle: 'idle' }[m.status];
  if (layer === 'oee') return oee === 0 ? (m.status === 'down' ? 'crit' : 'idle') : oee >= 80 ? 'ok' : oee >= 65 ? 'warn' : 'crit';
  if (layer === 'alarm') { const a = alarms.filter((x) => x.machine === m.id && x.status !== 'cleared'); return a.some((x) => x.severity === 'crit') ? 'crit' : a.some((x) => x.severity === 'warn') ? 'warn' : a.length ? 'info' : 'idle'; }
  const [t, sp] = PM_TEMP[m.id]; if (!t) return 'idle'; const d = t - sp; return d > 5 ? 'crit' : d > 2 ? 'warn' : 'ok';
}

function PMTile({ m, layer, alarms, shift, selected, dim, onClick }) {
  const tone = pmTone(m, layer, alarms, shift);
  const oee = m.oee > 0 ? Math.max(1, m.oee + PM_SHIFT_DELTA[shift]) : 0;
  const [t, sp] = PM_TEMP[m.id];
  const nAl = alarms.filter((x) => x.machine === m.id && x.status !== 'cleared').length;
  const big = layer === 'temp' ? (t ? t.toFixed(1) : '—') : layer === 'alarm' ? String(nAl) : layer === 'status' ? m.status.toUpperCase() : (oee ? oee.toFixed(1) : '—');
  const unit = layer === 'temp' ? '°C' : layer === 'oee' ? '%' : layer === 'alarm' ? 'active' : '';
  const c = `var(--${tone === 'info' ? 'info' : tone})`;
  return (
    <button onClick={onClick} style={{
      textAlign: 'left', padding: '10px 12px', borderRadius: 'var(--r-md)', display: 'flex', flexDirection: 'column', gap: 6,
      background: `color-mix(in oklab, ${c} ${tone === 'idle' ? 6 : 10}%, var(--bg-elev-1))`,
      border: `1px solid ${selected ? 'var(--accent)' : `color-mix(in oklab, ${c} 40%, var(--line))`}`,
      boxShadow: selected ? '0 0 0 1px var(--accent), 0 0 18px -4px var(--accent)' : 'none',
      opacity: dim ? 0.3 : 1, transition: 'opacity .2s, box-shadow .2s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className={`dot dot--${tone === 'info' ? 'warn' : tone}`} style={tone === 'info' ? { background: 'var(--info)', boxShadow: '0 0 6px var(--info)' } : null}></span>
        <span className="mono" style={{ fontSize: 12, fontWeight: 500 }}>{m.id}</span>
        <span className="muted-mono" style={{ marginLeft: 'auto' }}>{m.type.split(' ')[0]}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
        <span className="mono" style={{ fontSize: layer === 'status' ? 15 : 24, fontWeight: 500, letterSpacing: '-0.02em', color: tone === 'idle' ? 'var(--fg-dim)' : 'var(--fg)', lineHeight: 1.2 }}>{big}</span>
        <span className="mono fg-dim" style={{ fontSize: 10.5 }}>{unit}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span className="muted-mono">Cycle {m.cycle ? m.cycle + 's' : '—'}</span>
        <span className="muted-mono">{m.sku}</span>
      </div>
    </button>
  );
}

function PMZone({ title, sub, children, style }) {
  return (
    <div style={{ border: '1px dashed var(--line-strong)', borderRadius: 'var(--r-md)', padding: '10px 12px', background: 'color-mix(in oklab, var(--bg-elev-0) 70%, transparent)', display: 'flex', flexDirection: 'column', gap: 4, ...style }}>
      <span className="muted-mono" style={{ color: 'var(--fg-muted)' }}>{title}</span>
      <span style={{ fontSize: 11.5, color: 'var(--fg-dim)' }}>{sub}</span>
      {children}
    </div>
  );
}

const PM_AISLE = { background: 'repeating-linear-gradient(to bottom, color-mix(in oklab, var(--warn) 35%, transparent) 0 8px, transparent 8px 16px)', width: 2, margin: '0 auto', borderRadius: 1 };

function PlantMap({ tweak, onOpenAI }) {
  const D = window.MasahiroData; const I = window.Icon;
  const [layer, setLayer] = useState('status');
  const [line, setLine] = useState('all');
  const [shift, setShift] = useState('A');
  const [sel, setSel] = useState('IMM-04');
  const byId = useMemo(() => Object.fromEntries(D.MACHINES.map((m) => [m.id, m])), []);
  const counts = useMemo(() => D.MACHINES.reduce((a, m) => ({ ...a, [m.status]: (a[m.status] || 0) + 1 }), {}), []);
  const m = byId[sel]; const mLine = PM_LINES.find((l) => l.machines.includes(sel)).id;
  const mAlarms = D.ALARMS.filter((a) => a.machine === sel && a.status !== 'cleared');
  const oee = m.oee > 0 ? Math.max(1, m.oee + PM_SHIFT_DELTA[shift]) : 0;
  const avl = oee ? Math.min(99, oee + 8.2) : 0, qlt = oee ? 98.4 : 0, prf = oee ? Math.min(99, (oee / (avl / 100) / (qlt / 100))) : 0;
  const pct = Math.min(100, (m.output / m.target) * 100);
  const legend = { status: [['ok', 'Running'], ['warn', 'Warning'], ['crit', 'Down'], ['idle', 'Idle']], oee: [['ok', '≥ 80%'], ['warn', '65–80%'], ['crit', '< 65%'], ['idle', 'No data']], alarm: [['crit', 'Critical'], ['warn', 'Warning'], ['info', 'Info'], ['idle', 'None']], temp: [['ok', 'Within ±2°C'], ['warn', '+2 to +5°C'], ['crit', '> +5°C'], ['idle', 'Off']] }[layer];

  return (
    <>
      <div className="page__head">
        <div>
          <div className="page__meta">Operations · Molding hall · Plant Osaka-3</div>
          <h1 className="page__title">Plant Map</h1>
        </div>
        <div className="page__actions">
          <div className="seg">{['all', 'A', 'B', 'C', 'D'].map((l) => <button key={l} aria-selected={line === l} onClick={() => setLine(l)}>{l === 'all' ? 'All lines' : 'Line ' + l}</button>)}</div>
          <div className="seg">{['A', 'B', 'C'].map((s) => <button key={s} aria-selected={shift === s} onClick={() => setShift(s)}>Shift {s}</button>)}</div>
          <button className="btn btn--primary" onClick={onOpenAI}><I.Sparkle className="ai-spark" size={12} />Analyze Layout</button>
        </div>
      </div>

      {tweak.ai === 'banner' && <window.MasahiroChrome.AIBanner page="plant" onClose={() => {}} />}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12 }}>
        {[['Running', counts.running, 'ok'], ['Warning', counts.warning, 'warn'], ['Down', counts.down, 'crit'], ['Idle', counts.idle, 'idle']].map(([l, v, t]) => (
          <div key={l} className="card kpi" style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: '12px 16px' }}>
            <span className={`dot dot--${t}`}></span>
            <span className="kpi__label">{l}</span>
            <span className="kpi__value" style={{ marginLeft: 'auto', fontSize: 24 }}>{v}<span className="kpi__unit"> / 8</span></span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 12, alignItems: 'start' }}>
        <section className="card">
          <div className="card__head">
            <span className="card__title">Floor plan</span>
            <div className="seg" style={{ marginLeft: 12 }}>
              {[['status', 'Status'], ['oee', 'OEE'], ['alarm', 'Alarm'], ['temp', 'Mold temp']].map(([k, l]) => <button key={k} aria-selected={layer === k} onClick={() => setLayer(k)}>{l}</button>)}
            </div>
            <div style={{ flex: 1 }}></div>
            <div className="legend">{legend.map(([t, l]) => <span key={l}><i style={{ background: `var(--${t === 'info' ? 'info' : t})` }}></i>{l}</span>)}</div>
          </div>
          <div className="card__body" style={{ display: 'grid', gridTemplateColumns: '150px 14px minmax(0,1fr) 14px 130px', gap: 8, minHeight: 520 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <PMZone title="Material warehouse" sub="Resin · 3 silos" style={{ flex: 1 }}><div className="mono" style={{ fontSize: 11, color: 'var(--warn)', marginTop: 'auto' }}>IMM-02 hopper 24%</div></PMZone>
              <PMZone title="Mold room" sub="42 molds · 2 in service" style={{ flex: 1 }} />
            </div>
            <div style={PM_AISLE}></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {PM_LINES.map((l) => (
                <div key={l.id} style={{ flex: 1, border: '1px solid var(--line)', borderRadius: 'var(--r-md)', background: 'var(--bg-elev-0)', padding: '8px 10px 10px', display: 'flex', flexDirection: 'column', gap: 8, opacity: line === 'all' || line === l.id ? 1 : 0.35, transition: 'opacity .2s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="mono" style={{ fontSize: 12, fontWeight: 500 }}>LINE {l.id}</span>
                    <span className="muted-mono">Operator · {PM_OPS[l.id][shift]}</span>
                    <span className="muted-mono" style={{ marginLeft: 'auto' }}>→ QC</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, flex: 1 }}>
                    {l.machines.map((id) => <PMTile key={id} m={byId[id]} layer={layer} alarms={D.ALARMS} shift={shift} selected={sel === id} dim={line !== 'all' && line !== l.id} onClick={() => setSel(id)} />)}
                  </div>
                  <div style={{ height: 0, borderTop: '2px dashed var(--line-strong)' }}></div>
                </div>
              ))}
            </div>
            <div style={PM_AISLE}></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <PMZone title="QC area" sub="Inspection · 2 stations" style={{ flex: 1 }} />
              <PMZone title="Shipping" sub="Dock 1–2" style={{ flex: 1 }} />
            </div>
          </div>
          <div className="card__foot"><span style={{ width: 14, borderTop: '2px dashed color-mix(in oklab, var(--warn) 50%, transparent)' }}></span><span className="muted-mono">Forklift aisle</span><span className="muted-mono" style={{ marginLeft: 'auto' }}>Click a press for details</span></div>
        </section>

        <section className="card" style={{ position: 'sticky', top: 0 }}>
          <div className="card__head">
            <span className="mono" style={{ fontSize: 13, fontWeight: 500 }}>{m.id}</span>
            <span className={`chip chip--${{ running: 'ok', warning: 'warn', down: 'crit', idle: 'idle' }[m.status]}`}>{m.status.toUpperCase()}</span>
            <span className="card__sub">Line {mLine}</span>
          </div>
          <div className="card__body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div className="muted-mono">{m.type}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                <span className="mono" style={{ fontSize: 40, fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1 }}>{oee ? oee.toFixed(1) : '—'}</span>
                <span className="mono fg-dim">% OEE · Shift {shift}</span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {[['A', avl], ['P', prf], ['Q', qlt]].map(([k, v]) => (
                <div key={k} style={{ padding: '8px 10px', border: '1px solid var(--line)', borderRadius: 'var(--r-md)', background: 'var(--bg-elev-0)' }}>
                  <div className="muted-mono">{k}</div>
                  <div className="mono" style={{ fontSize: 15, fontWeight: 500 }}>{v ? v.toFixed(1) : '—'}</div>
                </div>
              ))}
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="muted-mono">SKU · {m.sku}</span><span className="mono fg-muted" style={{ fontSize: 11.5 }}>{m.output} / {m.target}</span></div>
              <div className="kpi__bar"><i style={{ width: `${pct}%` }}></i></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div><div className="muted-mono">Cycle</div><div className="mono">{m.cycle ? m.cycle + ' s' : '—'}</div></div>
              <div><div className="muted-mono">Mold temp</div><div className="mono">{PM_TEMP[m.id][0] ? PM_TEMP[m.id][0].toFixed(1) + '°C' : '—'}</div></div>
              <div style={{ gridColumn: 'span 2' }}><div className="muted-mono">Operator</div><div>{PM_OPS[mLine][shift]}</div></div>
            </div>
            <div className="hairline"></div>
            <div className="muted-mono">Active alarms · {mAlarms.length}</div>
            {mAlarms.length === 0 && <div style={{ fontSize: 12.5, color: 'var(--fg-dim)' }}>No active alarms on this press.</div>}
            {mAlarms.map((a) => (
              <div key={a.id} style={{ display: 'grid', gridTemplateColumns: '8px 1fr auto', gap: 10, alignItems: 'center' }}>
                <span className={`dot dot--${a.severity === 'info' ? 'idle' : a.severity}`}></span>
                <div style={{ minWidth: 0 }}><div style={{ fontSize: 12.5 }}>{a.title}</div><div className="muted-mono">{a.code} · {a.age}</div></div>
                <button className="btn btn--sm" onClick={onOpenAI}><I.Sparkle className="ai-spark" size={11} />Explain</button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

window.MasahiroPlant = PlantMap;
