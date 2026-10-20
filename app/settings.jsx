// app/settings.jsx — Settings: 10 tabs
const { useState } = React;

const ST_TABS = [
  ['general', 'General'], ['machines', 'Machines & Lines'], ['targets', 'OEE Targets'], ['shifts', 'Shifts'], ['downtime', 'Downtime Codes'],
  ['alarms', 'Alarms & Notifications'], ['sources', 'Data Sources'], ['ai', 'AI Insight'], ['users', 'Users & Roles'], ['appearance', 'Appearance'],
];

function Toggle({ on, onChange }) {
  return (
    <button role="switch" aria-checked={on} onClick={() => onChange(!on)} style={{ width: 34, height: 18, borderRadius: 9, flex: '0 0 34px', position: 'relative', background: on ? 'var(--accent)' : 'var(--bg-elev-3)', border: '1px solid ' + (on ? 'var(--accent)' : 'var(--line-strong)'), transition: 'background .15s' }}>
      <span style={{ position: 'absolute', top: 2, left: on ? 18 : 2, width: 12, height: 12, borderRadius: '50%', background: '#fff', transition: 'left .15s' }}></span>
    </button>
  );
}
const inp = { height: 30, padding: '0 10px', background: 'var(--bg-elev-0)', border: '1px solid var(--line)', borderRadius: 'var(--r-md)', color: 'var(--fg)', outline: 'none', fontSize: 12.5, minWidth: 0 };
function Inp({ value, onChange, w = 200, mono, suffix }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <input value={value} onChange={(e) => onChange(e.target.value)} style={{ ...inp, width: w, fontFamily: mono ? 'var(--f-mono)' : 'inherit', textAlign: mono ? 'right' : 'left' }} />
      {suffix && <span className="muted-mono">{suffix}</span>}
    </span>
  );
}
function Sel({ value, onChange, options, w }) {
  return <select value={value} onChange={(e) => onChange(e.target.value)} style={{ ...inp, width: w, paddingRight: 6 }}>{options.map((o) => <option key={o} value={o}>{o}</option>)}</select>;
}
function Row({ label, hint, children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: 24, alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--line)' }}>
      <div><div style={{ fontSize: 13 }}>{label}</div>{hint && <div style={{ fontSize: 11.5, color: 'var(--fg-dim)', marginTop: 2 }}>{hint}</div>}</div>
      <div>{children}</div>
    </div>
  );
}
function Panel({ title, sub, action, children, flush }) {
  return (
    <section className="card" style={{ marginBottom: 12 }}>
      <div className="card__head"><span className="card__title">{title}</span>{sub && <span className="card__sub">{sub}</span>}{action && <div style={{ marginLeft: sub ? 0 : 'auto' }}>{action}</div>}</div>
      <div className="card__body" style={flush ? { padding: 0 } : { paddingTop: 2, paddingBottom: 2 }}>{children}</div>
    </section>
  );
}
function Chips({ options, value, onChange, multi }) {
  const on = (o) => multi ? value.includes(o) : value === o;
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {options.map((o) => <button key={o} className="chip" onClick={() => onChange(multi ? (on(o) ? value.filter((x) => x !== o) : [...value, o]) : o)} style={on(o) ? { color: 'var(--fg)', background: 'var(--accent-soft)', borderColor: 'var(--line-glow)' } : { cursor: 'pointer' }}>{o}</button>)}
    </div>
  );
}

/* ───── tabs ───── */

function TabGeneral({ d }) {
  const [v, set] = d('general', { plant: 'Plant Osaka-3', tz: 'Asia/Tokyo (UTC+9)', lang: 'English', date: 'YYYY-MM-DD', num: '1,234.5', temp: '°C', output: 'pcs' });
  const u = (k) => (x) => set({ ...v, [k]: x });
  return (<>
    <Panel title="Plant"><Row label="Plant name" hint="Shown in the sidebar and on reports"><Inp value={v.plant} onChange={u('plant')} /></Row><Row label="Time zone"><Sel value={v.tz} onChange={u('tz')} options={['Asia/Tokyo (UTC+9)', 'Asia/Jakarta (UTC+7)', 'Europe/Berlin (UTC+1)', 'America/Chicago (UTC-6)']} w={220} /></Row></Panel>
    <Panel title="Language & format"><Row label="Language"><Sel value={v.lang} onChange={u('lang')} options={['English', 'Bahasa Indonesia', '日本語']} w={220} /></Row><Row label="Date format"><Sel value={v.date} onChange={u('date')} options={['YYYY-MM-DD', 'DD/MM/YYYY', 'MM/DD/YYYY']} w={220} /></Row><Row label="Number format"><Sel value={v.num} onChange={u('num')} options={['1,234.5', '1.234,5', '1 234,5']} w={220} /></Row></Panel>
    <Panel title="Units"><Row label="Temperature"><Chips options={['°C', '°F']} value={v.temp} onChange={u('temp')} /></Row><Row label="Output unit"><Chips options={['pcs', 'kg', 'shots']} value={v.output} onChange={u('output')} /></Row></Panel>
  </>);
}

function TabMachines({ d }) {
  const D = window.MasahiroData; const I = window.Icon;
  const [rows, set] = d('machines', D.MACHINES.map((m) => ({ id: m.id, type: m.type, line: m.line, cycle: String(m.cycle || 45), target: String(m.target), on: m.status !== 'idle' || m.id === 'IMM-06' })));
  const up = (i, k, x) => set(rows.map((r, j) => (j === i ? { ...r, [k]: x } : r)));
  return (
    <Panel title="Machines" sub={rows.length + ' presses'} action={<button className="btn btn--sm btn--primary" onClick={() => set([...rows, { id: 'IMM-' + String(rows.length + 1).padStart(2, '0'), type: '180T Hydraulic', line: 'Line A', cycle: '40', target: '1000', on: true }])}>+ Add machine</button>} flush>
      <table className="table"><thead><tr><th>ID</th><th>Type</th><th>Line</th><th style={{ textAlign: 'right' }}>Ideal cycle</th><th style={{ textAlign: 'right' }}>Target / shift</th><th>Active</th></tr></thead>
        <tbody>{rows.map((r, i) => (<tr key={r.id}><td className="mono">{r.id}</td><td className="fg-muted">{r.type}</td>
          <td><Sel value={r.line} onChange={(x) => up(i, 'line', x)} options={['Line A', 'Line B', 'Line C', 'Line D']} /></td>
          <td style={{ textAlign: 'right' }}><Inp value={r.cycle} onChange={(x) => up(i, 'cycle', x)} w={64} mono suffix="s" /></td>
          <td style={{ textAlign: 'right' }}><Inp value={r.target} onChange={(x) => up(i, 'target', x)} w={72} mono suffix="pcs" /></td>
          <td><Toggle on={r.on} onChange={(x) => up(i, 'on', x)} /></td></tr>))}</tbody></table>
    </Panel>
  );
}

function TabTargets({ d }) {
  const [v, set] = d('targets', { oee: 80, a: 90, p: 95, q: 99, green: 80, yellow: 65 });
  const [lines, setL] = d('lineTargets', { A: 82, B: 75, C: 80, D: 85 });
  const num = (k, suf = '%') => <Inp value={String(v[k])} onChange={(x) => set({ ...v, [k]: +x || 0 })} w={64} mono suffix={suf} />;
  return (<>
    <Panel title="Plant targets"><Row label="OEE">{num('oee')}</Row><Row label="Availability">{num('a')}</Row><Row label="Performance">{num('p')}</Row><Row label="Quality">{num('q')}</Row></Panel>
    <Panel title="Color thresholds" sub="Applied to gauges, tables, and the plant map">
      <Row label="Green at or above">{num('green')}</Row><Row label="Yellow at or above" hint="Below this value is shown red">{num('yellow')}</Row>
      <div style={{ padding: '14px 0 12px' }}><div style={{ display: 'flex', height: 10, borderRadius: 3, overflow: 'hidden' }}><div style={{ width: v.yellow + '%', background: 'var(--crit)' }}></div><div style={{ width: Math.max(0, v.green - v.yellow) + '%', background: 'var(--warn)' }}></div><div style={{ flex: 1, background: 'var(--ok)' }}></div></div><div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}><span className="muted-mono">0</span><span className="muted-mono">{v.yellow}</span><span className="muted-mono">{v.green}</span><span className="muted-mono">100</span></div></div>
    </Panel>
    <Panel title="OEE target per line">{Object.keys(lines).map((k) => <Row key={k} label={'Line ' + k}><Inp value={String(lines[k])} onChange={(x) => setL({ ...lines, [k]: +x || 0 })} w={64} mono suffix="%" /></Row>)}</Panel>
  </>);
}

function TabShifts({ d }) {
  const [rows, set] = d('shifts', [{ id: 'A', s: '06:00', e: '14:00', br: '45', lead: 'M. Tanaka' }, { id: 'B', s: '14:00', e: '22:00', br: '45', lead: 'R. Okafor' }, { id: 'C', s: '22:00', e: '06:00', br: '45', lead: 'L. Mendoza' }]);
  const [days, setDays] = d('days', ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
  const [hol, setHol] = d('holidays', [['Jun 05', 'Plant maintenance shutdown'], ['Jul 20', 'Marine Day'], ['Aug 11', 'Mountain Day']]);
  const up = (i, k, x) => set(rows.map((r, j) => (j === i ? { ...r, [k]: x } : r)));
  return (<>
    <Panel title="Shift pattern" flush><table className="table"><thead><tr><th>Shift</th><th>Start</th><th>End</th><th style={{ textAlign: 'right' }}>Break</th><th>Lead</th></tr></thead>
      <tbody>{rows.map((r, i) => (<tr key={r.id}><td><span className="chip">{r.id}</span></td><td><Inp value={r.s} onChange={(x) => up(i, 's', x)} w={72} mono /></td><td><Inp value={r.e} onChange={(x) => up(i, 'e', x)} w={72} mono /></td><td style={{ textAlign: 'right' }}><Inp value={r.br} onChange={(x) => up(i, 'br', x)} w={56} mono suffix="min" /></td><td><Inp value={r.lead} onChange={(x) => up(i, 'lead', x)} w={150} /></td></tr>))}</tbody></table></Panel>
    <Panel title="Working days"><Row label="Production days" hint="Days counted as planned production time"><Chips multi options={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']} value={days} onChange={setDays} /></Row></Panel>
    <Panel title="Holidays & shutdowns" action={<button className="btn btn--sm" onClick={() => setHol([...hol, ['—', 'New entry']])}>+ Add</button>}>
      {hol.map(([dt, n], i) => <Row key={i} label={n}><span style={{ display: 'inline-flex', gap: 10, alignItems: 'center' }}><span className="mono fg-muted">{dt}</span><button className="icon-btn" style={{ width: 26, height: 26 }} onClick={() => setHol(hol.filter((_, j) => j !== i))}><window.Icon.Close size={11} /></button></span></Row>)}
    </Panel>
  </>);
}

function TabDowntime({ d }) {
  const [rows, set] = d('codes', [['DT-01', 'Mold change', 'Planned'], ['DT-02', 'Material refill', 'Planned'], ['DT-03', 'Setup & adjustment', 'Planned'], ['DT-04', 'Unplanned breakdown', 'Unplanned'], ['DT-05', 'Quality check / scrap', 'Unplanned'], ['DT-06', 'Breaks', 'Planned'], ['DT-07', 'No operator', 'Unplanned']].map(([c, r, k]) => ({ c, r, k, on: true })));
  const up = (i, k, x) => set(rows.map((r, j) => (j === i ? { ...r, [k]: x } : r)));
  return (
    <Panel title="Reason codes" sub={rows.length + ' codes'} action={<button className="btn btn--sm btn--primary" onClick={() => set([...rows, { c: 'DT-' + String(rows.length + 1).padStart(2, '0'), r: 'New reason', k: 'Unplanned', on: true }])}>+ Add code</button>} flush>
      <table className="table"><thead><tr><th>Code</th><th>Reason</th><th>Category</th><th>Active</th></tr></thead>
        <tbody>{rows.map((r, i) => (<tr key={r.c}><td className="mono fg-muted">{r.c}</td><td><Inp value={r.r} onChange={(x) => up(i, 'r', x)} w={240} /></td>
          <td><div className="seg">{['Planned', 'Unplanned'].map((k) => <button key={k} aria-selected={r.k === k} onClick={() => up(i, 'k', k)}>{k}</button>)}</div></td><td><Toggle on={r.on} onChange={(x) => up(i, 'on', x)} /></td></tr>))}</tbody></table>
    </Panel>
  );
}

function TabAlarms({ d }) {
  const [rules, set] = d('rules', [['Hydraulic pressure low', '< 110 bar', 'crit', '30'], ['Mold temperature drift', '> ±5 °C', 'warn', '120'], ['Cycle time over standard', '> +10%', 'warn', '300'], ['Hopper level low', '< 25%', 'info', '0'], ['Cooling flow reduced', '< 80%', 'warn', '60']].map(([n, t, s, dl]) => ({ n, t, s, dl, on: true })));
  const [ch, setCh] = d('channels', { app: true, email: true, wa: false, tg: false });
  const [esc, setEsc] = d('esc', [['Critical', '10', 'Supervisor'], ['Critical', '30', 'Plant manager'], ['Warning', '60', 'Supervisor']]);
  const up = (i, k, x) => set(rules.map((r, j) => (j === i ? { ...r, [k]: x } : r)));
  return (<>
    <Panel title="Alarm rules" flush><table className="table"><thead><tr><th>Rule</th><th>Threshold</th><th>Severity</th><th style={{ textAlign: 'right' }}>Delay</th><th>On</th></tr></thead>
      <tbody>{rules.map((r, i) => (<tr key={r.n}><td>{r.n}</td><td><Inp value={r.t} onChange={(x) => up(i, 't', x)} w={110} mono /></td>
        <td><div className="seg">{[['crit', 'Critical'], ['warn', 'Warning'], ['info', 'Info']].map(([k, l]) => <button key={k} aria-selected={r.s === k} onClick={() => up(i, 's', k)}>{l}</button>)}</div></td>
        <td style={{ textAlign: 'right' }}><Inp value={r.dl} onChange={(x) => up(i, 'dl', x)} w={56} mono suffix="s" /></td><td><Toggle on={r.on} onChange={(x) => up(i, 'on', x)} /></td></tr>))}</tbody></table></Panel>
    <Panel title="Notification channels">{[['app', 'In-app notification center'], ['email', 'Email'], ['wa', 'WhatsApp'], ['tg', 'Telegram']].map(([k, l]) => <Row key={k} label={l}><Toggle on={ch[k]} onChange={(x) => setCh({ ...ch, [k]: x })} /></Row>)}</Panel>
    <Panel title="Escalation" sub="Unacknowledged alarms">{esc.map(([sv, m, to], i) => <Row key={i} label={<span>{sv} alarm unacknowledged for <b className="mono">{m} min</b></span>} hint={'Notify ' + to}><Inp value={m} onChange={(x) => setEsc(esc.map((e, j) => (j === i ? [e[0], x, e[2]] : e)))} w={56} mono suffix="min" /></Row>)}</Panel>
  </>);
}

function TabSources({ d }) {
  const [rows, set] = d('sources', [['IMM-01 … 04', 'Modbus TCP', '10.20.4.11:502', '1 s', 'ok'], ['IMM-05 … 06', 'OPC UA', 'opc.tcp://10.20.4.21:4840', '1 s', 'ok'], ['IMM-07 … 08', 'OPC UA', 'opc.tcp://10.20.4.22:4840', '2 s', 'warn'], ['Cloud broker', 'MQTT', 'mqtts://broker.plant.local:8883', 'push', 'ok'], ['Energy meters', 'Modbus TCP', '10.20.5.8:502', '5 s', 'crit']].map(([n, p, h, i, s]) => ({ n, p, h, i, s })));
  const [busy, setBusy] = useState(null);
  const test = (k) => { setBusy(k); setTimeout(() => { set(rows.map((r, j) => (j === k ? { ...r, s: 'ok' } : r))); setBusy(null); }, 1100); };
  const lbl = { ok: 'CONNECTED', warn: 'DEGRADED', crit: 'OFFLINE' };
  return (
    <Panel title="Connections" sub="Telemetry sources" action={<button className="btn btn--sm btn--primary">+ Add source</button>} flush>
      <table className="table"><thead><tr><th>Source</th><th>Protocol</th><th>Endpoint</th><th>Interval</th><th>Status</th><th></th></tr></thead>
        <tbody>{rows.map((r, i) => (<tr key={r.n}><td>{r.n}</td><td><span className="chip">{r.p}</span></td><td className="mono fg-muted">{r.h}</td><td className="mono">{r.i}</td><td><span className={`chip chip--${r.s}`}>{busy === i ? 'TESTING…' : lbl[r.s]}</span></td><td style={{ textAlign: 'right' }}><button className="btn btn--sm" onClick={() => test(i)} disabled={busy !== null}>Test connection</button></td></tr>))}</tbody></table>
    </Panel>
  );
}

function TabAI({ d }) {
  const [v, set] = d('ai', { dashboard: true, records: true, analytics: true, alarms: true, reports: true, schedule: true, plant: true, style: 'Concise', lang: 'Follow system', scope: ['Production', 'Downtime', 'Alarms', 'Maintenance'] });
  return (<>
    <Panel title="Enable AI per page">{[['dashboard', 'Dashboard · Generate AI Insight'], ['records', 'OEE Record · Analyze Record'], ['analytics', 'Analytics · Analyze Trend'], ['alarms', 'Alarms · Explain Alarm'], ['reports', 'Reports · AI Report Summary'], ['schedule', 'Schedule · AI Recommendation'], ['plant', 'Plant Map · Analyze Layout']].map(([k, l]) => <Row key={k} label={l}><Toggle on={v[k]} onChange={(x) => set({ ...v, [k]: x })} /></Row>)}</Panel>
    <Panel title="Output"><Row label="Explanation style" hint="Concise suits operators; detailed suits supervisors"><div className="seg">{['Concise', 'Detailed'].map((s) => <button key={s} aria-selected={v.style === s} onClick={() => set({ ...v, style: s })}>{s}</button>)}</div></Row><Row label="Language"><Sel value={v.lang} onChange={(x) => set({ ...v, lang: x })} options={['Follow system', 'English', 'Bahasa Indonesia', '日本語']} w={180} /></Row></Panel>
    <Panel title="Data scope" sub="What the AI may analyze"><Row label="Included data"><Chips multi options={['Production', 'Downtime', 'Alarms', 'Maintenance', 'Operator names']} value={v.scope} onChange={(x) => set({ ...v, scope: x })} /></Row></Panel>
  </>);
}

function TabUsers({ d }) {
  const [users, set] = d('users', [['Mika Tanaka', 'mika.t@plant.local', 'Supervisor'], ['Ren Okafor', 'ren.o@plant.local', 'Supervisor'], ['Sara Aronova', 'sara.a@plant.local', 'Manager'], ['Kenji Sato', 'kenji.s@plant.local', 'Operator'], ['Hiro Mori', 'hiro.m@plant.local', 'Maintenance']]);
  const roles = ['Operator', 'Supervisor', 'Maintenance', 'Manager'];
  const pages = ['Dashboard', 'Plant Map', 'Alarms', 'Schedule', 'OEE Record', 'Analytics', 'Reports', 'Settings'];
  const perm = { Operator: [2, 2, 2, 1, 0, 0, 0, 0], Supervisor: [2, 2, 2, 2, 2, 2, 2, 1], Maintenance: [1, 2, 2, 2, 1, 1, 0, 0], Manager: [2, 2, 1, 1, 2, 2, 2, 2] };
  const [P, setP] = d('perm', perm);
  const cyc = (r, i) => setP({ ...P, [r]: P[r].map((x, j) => (j === i ? (x + 1) % 3 : x)) });
  const sym = ['—', 'View', 'Edit'], col = ['var(--fg-faint)', 'var(--fg-muted)', 'var(--accent)'];
  return (<>
    <Panel title="Users" sub={users.length + ' accounts'} action={<button className="btn btn--sm btn--primary">+ Invite user</button>} flush>
      <table className="table"><thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead>
        <tbody>{users.map((u, i) => (<tr key={u[1]}><td><span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}><span className="avatar">{u[0].split(' ').map((s) => s[0]).join('')}</span>{u[0]}</span></td><td className="mono fg-muted">{u[1]}</td><td><Sel value={u[2]} onChange={(x) => set(users.map((r, j) => (j === i ? [r[0], r[1], x] : r)))} options={roles} w={140} /></td></tr>))}</tbody></table>
    </Panel>
    <Panel title="Access by role" sub="Click a cell to cycle — / View / Edit" flush>
      <table className="table"><thead><tr><th>Role</th>{pages.map((p) => <th key={p} style={{ textAlign: 'center' }}>{p}</th>)}</tr></thead>
        <tbody>{roles.map((r) => (<tr key={r}><td>{r}</td>{pages.map((p, i) => <td key={p} style={{ textAlign: 'center' }}><button className="mono" onClick={() => cyc(r, i)} style={{ color: col[P[r][i]], fontSize: 11.5, padding: '3px 6px', borderRadius: 4 }}>{sym[P[r][i]]}</button></td>)}</tr>))}</tbody></table>
    </Panel>
  </>);
}

function TabAppearance({ d, tweak, setTweak }) {
  const [v, set] = d('appearance', { density: 'Standard' });
  const ACC = [['#2b6cff', 'Electric blue'], ['#22d3ee', 'Cyan'], ['#f59e0b', 'Amber'], ['#34d399', 'Green']];
  return (<>
    <Panel title="Theme"><Row label="Accent color"><div style={{ display: 'flex', gap: 10 }}>{ACC.map(([c, n]) => <button key={c} title={n} onClick={() => setTweak('accent', c)} style={{ width: 28, height: 28, borderRadius: 6, background: c, boxShadow: tweak.accent === c ? '0 0 0 2px var(--bg-elev-1), 0 0 0 4px ' + c : 'none' }}></button>)}</div></Row>
      <Row label="Interface style" hint="Modern uses sans-serif titles; SCADA is mono and tighter"><div className="seg">{[['modern', 'Modern'], ['scada', 'SCADA']].map(([k, l]) => <button key={k} aria-selected={tweak.variant === k} onClick={() => setTweak('variant', k)}>{l}</button>)}</div></Row></Panel>
    <Panel title="Dashboard"><Row label="OEE hero style"><div className="seg">{['gauge', 'number', 'ring', 'dial'].map((k) => <button key={k} aria-selected={tweak.hero === k} onClick={() => setTweak('hero', k)}>{k}</button>)}</div></Row>
      <Row label="Chart style"><div className="seg">{['line', 'area', 'bars'].map((k) => <button key={k} aria-selected={tweak.chart === k} onClick={() => setTweak('chart', k)}>{k}</button>)}</div></Row>
      <Row label="AI panel"><div className="seg">{['drawer', 'banner', 'card'].map((k) => <button key={k} aria-selected={tweak.ai === k} onClick={() => setTweak('ai', k)}>{k}</button>)}</div></Row>
      <Row label="Data density" hint="Sparse for wall displays, dense for supervisors"><div className="seg">{['Sparse', 'Standard', 'Dense'].map((k) => <button key={k} aria-selected={v.density === k} onClick={() => set({ ...v, density: k })}>{k}</button>)}</div></Row></Panel>
  </>);
}

function Settings({ tweak, setTweak }) {
  const [tab, setTab] = useState('general');
  const [store, setStore] = useState({});
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const d = (key, init) => [store[key] !== undefined ? store[key] : init, (x) => { setStore((s) => ({ ...s, [key]: x })); setDirty(true); setSaved(false); }];
  const T = { general: TabGeneral, machines: TabMachines, targets: TabTargets, shifts: TabShifts, downtime: TabDowntime, alarms: TabAlarms, sources: TabSources, ai: TabAI, users: TabUsers, appearance: TabAppearance }[tab];
  const save = () => { setDirty(false); setSaved(true); setTimeout(() => setSaved(false), 2200); };
  const cur = ST_TABS.find((t) => t[0] === tab)[1];
  return (<>
    <div className="page__head"><div><div className="page__meta">Plant · configuration</div><h1 className="page__title">Settings</h1></div>
      <div className="page__actions">{saved && <span className="chip chip--ok">✓ SAVED</span>}{dirty && <span className="chip chip--warn">UNSAVED CHANGES</span>}
        <button className="btn" disabled={!dirty} onClick={() => { setStore({}); setDirty(false); }}>Discard</button><button className="btn btn--primary" disabled={!dirty} onClick={save}>Save changes</button></div></div>
    <div style={{ display: 'grid', gridTemplateColumns: '220px minmax(0,1fr)', gap: 16, alignItems: 'start' }}>
      <nav className="card" style={{ padding: 6, position: 'sticky', top: 0 }}>
        {ST_TABS.map(([k, l], i) => (<div key={k} onClick={() => setTab(k)} className={`nav__item ${tab === k ? 'nav__item--active' : ''}`} style={{ cursor: 'pointer' }}><span className="mono fg-dim" style={{ fontSize: 10.5, width: 16 }}>{String(i + 1).padStart(2, '0')}</span><span>{l}</span></div>))}
      </nav>
      <div key={tab}><h2 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 600 }}>{cur}</h2><T d={d} tweak={tweak} setTweak={setTweak} /></div>
    </div>
  </>);
}

window.MasahiroSettings = Settings;
