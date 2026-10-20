// app/charts.jsx — lightweight SVG charts (no chart lib).
// All charts honour a `style` tweak ('line' | 'area' | 'bars') where it matters.

const { useMemo, useRef, useState, useEffect } = React;

/* ───────── helpers ───────── */

function useSize() {
  const ref = useRef(null);
  const [size, setSize] = useState({ w: 600, h: 200 });
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => {
      const r = e.contentRect;
      setSize({ w: Math.max(40, r.width), h: Math.max(40, r.height) });
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, size];
}

function pathFromPoints(pts) {
  if (!pts.length) return '';
  return pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ');
}

function smoothPath(pts) {
  if (pts.length < 2) return pathFromPoints(pts);
  const d = [`M${pts[0][0]},${pts[0][1]}`];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    const cx = (x0 + x1) / 2;
    d.push(`C${cx},${y0} ${cx},${y1} ${x1},${y1}`);
  }
  return d.join(' ');
}

/* ───────── Sparkline ───────── */

function Sparkline({ data, height = 36, stroke = 'currentColor', fill = false }) {
  const [ref, { w }] = useSize();
  const h = height;
  const min = Math.min(...data), max = Math.max(...data);
  const range = Math.max(1, max - min);
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * w,
    h - 4 - ((v - min) / range) * (h - 8),
  ]);
  return (
    <div ref={ref} style={{ width: '100%', height: h }}>
      <svg width={w} height={h} style={{ display: 'block' }}>
        {fill && (
          <path d={smoothPath(pts) + ` L${w},${h} L0,${h} Z`}
                fill={`color-mix(in oklab, ${stroke} 18%, transparent)`} />
        )}
        <path d={smoothPath(pts)} stroke={stroke} strokeWidth="1.5" fill="none" />
      </svg>
    </div>
  );
}

/* ───────── TimeSeries (the headline chart) ─────────
   style: 'line' | 'area' | 'bars'
   series: [{ name, color, data: [number, ...] }]
   labels: [string, ...] (one per index)
   target?: number — drawn as dashed horizontal line.
*/

function TimeSeries({ series, labels, style = 'area', target = null, height = 220, yMax = 100, yMin = 0 }) {
  const [ref, { w, h }] = useSize();
  const H = Math.max(120, h || height);
  const padL = 36, padR = 12, padT = 16, padB = 22;
  const innerW = Math.max(20, w - padL - padR);
  const innerH = H - padT - padB;
  const n = labels.length;

  const xOf = (i) => padL + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const yOf = (v) => padT + (1 - (v - yMin) / (yMax - yMin)) * innerH;

  const gridY = useMemo(() => {
    const steps = 4;
    return Array.from({ length: steps + 1 }, (_, i) => yMin + ((yMax - yMin) * i) / steps);
  }, [yMin, yMax]);

  return (
    <div ref={ref} style={{ width: '100%', height }}>
      <svg width={w} height={H} style={{ display: 'block' }}>
        {/* Gridlines + Y labels */}
        {gridY.map((g, i) => (
          <g key={i}>
            <line x1={padL} x2={w - padR} y1={yOf(g)} y2={yOf(g)} stroke="var(--line)" strokeDasharray={i === 0 ? '0' : '2 4'} />
            <text x={padL - 8} y={yOf(g) + 3.5} fontSize="10" fontFamily="var(--f-mono)" fill="var(--fg-dim)" textAnchor="end">{g}</text>
          </g>
        ))}
        {/* X labels (sparse) */}
        {labels.map((l, i) => (
          (i === 0 || i === labels.length - 1 || i % Math.ceil(labels.length / 6) === 0) && (
            <text key={i} x={xOf(i)} y={H - 6} fontSize="10" fontFamily="var(--f-mono)" fill="var(--fg-dim)" textAnchor="middle">{l}</text>
          )
        ))}
        {/* Target line */}
        {target != null && (
          <g>
            <line x1={padL} x2={w - padR} y1={yOf(target)} y2={yOf(target)} stroke="var(--fg-muted)" strokeDasharray="3 3" opacity="0.7" />
            <text x={w - padR - 4} y={yOf(target) - 4} fontSize="9" fontFamily="var(--f-mono)" fill="var(--fg-muted)" textAnchor="end">TGT {target}</text>
          </g>
        )}
        {/* Series */}
        {series.map((s, si) => {
          const color = s.color || 'var(--accent)';
          if (style === 'bars') {
            const bw = innerW / n * 0.6 / series.length;
            return s.data.map((v, i) => {
              const x = xOf(i) - (series.length * bw) / 2 + si * bw;
              const y = yOf(v);
              return <rect key={i} x={x} y={y} width={bw} height={yOf(yMin) - y} fill={color} opacity={0.85} rx="1" />;
            });
          }
          const pts = s.data.map((v, i) => [xOf(i), yOf(v)]);
          return (
            <g key={si}>
              {style === 'area' && (
                <path d={smoothPath(pts) + ` L${xOf(s.data.length - 1)},${yOf(yMin)} L${xOf(0)},${yOf(yMin)} Z`}
                      fill={`color-mix(in oklab, ${color} 22%, transparent)`} />
              )}
              <path d={smoothPath(pts)} stroke={color} strokeWidth="1.75" fill="none" />
              {/* end-marker */}
              <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="3" fill={color}
                      stroke="var(--bg-elev-1)" strokeWidth="1.5" />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ───────── Stacked-bar row (downtime breakdown) ───────── */

function StackedBar({ items, total }) {
  return (
    <div style={{ display: 'flex', width: '100%', height: 10, borderRadius: 3, overflow: 'hidden', background: 'var(--bg-elev-3)' }}>
      {items.map((it, i) => (
        <div key={i} title={`${it.reason} · ${it.minutes}m`} style={{ width: `${(it.minutes / total) * 100}%`, background: it.color }} />
      ))}
    </div>
  );
}

/* ───────── Gauge (radial 270°) — OEE hero variant 'gauge' ───────── */

function Gauge({ value = 78, size = 220, label = 'OEE', sub = 'Today', accent = 'var(--accent)' }) {
  const r = size / 2 - 16;
  const cx = size / 2, cy = size / 2 + 8;
  const start = 135, end = 405; // 270° span
  const polar = (deg) => [cx + r * Math.cos(deg * Math.PI / 180), cy + r * Math.sin(deg * Math.PI / 180)];
  const arc = (a, b) => {
    const [x1, y1] = polar(a), [x2, y2] = polar(b);
    const large = b - a > 180 ? 1 : 0;
    return `M${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2}`;
  };
  const pct = Math.max(0, Math.min(100, value));
  const endDeg = start + (end - start) * (pct / 100);

  // tick marks every 10%
  const ticks = Array.from({ length: 11 }, (_, i) => {
    const t = start + ((end - start) * i) / 10;
    const [x1, y1] = [cx + (r + 6) * Math.cos(t * Math.PI / 180), cy + (r + 6) * Math.sin(t * Math.PI / 180)];
    const [x2, y2] = [cx + (r + 11) * Math.cos(t * Math.PI / 180), cy + (r + 11) * Math.sin(t * Math.PI / 180)];
    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--line-strong)" strokeWidth="1" />;
  });

  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <svg width={size} height={size}>
        {ticks}
        <path d={arc(start, end)} stroke="var(--bg-elev-3)" strokeWidth="10" fill="none" strokeLinecap="round" />
        <path d={arc(start, endDeg)} stroke={accent} strokeWidth="10" fill="none" strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 6px color-mix(in oklab, ${accent} 60%, transparent))` }} />
        {/* zone indicators */}
        <text x={polar(start)[0]} y={polar(start)[1] + 14} fontSize="9" fontFamily="var(--f-mono)" fill="var(--fg-dim)" textAnchor="middle">0</text>
        <text x={polar(end)[0]}   y={polar(end)[1] + 14}   fontSize="9" fontFamily="var(--f-mono)" fill="var(--fg-dim)" textAnchor="middle">100</text>
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 0, paddingTop: 14,
      }}>
        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.18em', color: 'var(--fg-dim)', textTransform: 'uppercase' }}>{label}</div>
        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 48, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1, marginTop: 4 }}>
          {value.toFixed(1)}<span style={{ fontSize: 18, color: 'var(--fg-dim)' }}>%</span>
        </div>
        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.14em', color: 'var(--fg-dim)', textTransform: 'uppercase', marginTop: 8 }}>{sub}</div>
      </div>
    </div>
  );
}

/* ───────── Ring (closed-circle ring for stack hero) ───────── */

function Ring({ value = 78, size = 96, stroke = 9, label = '', accent = 'var(--accent)' }) {
  const r = size / 2 - stroke;
  const c = 2 * Math.PI * r;
  const off = c * (1 - Math.min(1, value / 100));
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} stroke="var(--bg-elev-3)" strokeWidth={stroke} fill="none" />
        <circle cx={size/2} cy={size/2} r={r} stroke={accent} strokeWidth={stroke} fill="none"
                strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
                transform={`rotate(-90 ${size/2} ${size/2})`}
                style={{ filter: `drop-shadow(0 0 4px color-mix(in oklab, ${accent} 50%, transparent))` }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 20, fontWeight: 500, lineHeight: 1 }}>{value.toFixed(1)}<span style={{ fontSize: 11, color: 'var(--fg-dim)' }}>%</span></div>
          {label && <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.16em', color: 'var(--fg-dim)', textTransform: 'uppercase', marginTop: 4 }}>{label}</div>}
        </div>
      </div>
    </div>
  );
}

/* ───────── Dial (needle hero variant) ───────── */

function Dial({ value = 78, size = 240, accent = 'var(--accent)' }) {
  const w = size, h = size * 0.62;
  const cx = w / 2, cy = h - 8, r = h - 28;
  const start = 180, end = 360;
  const polar = (deg) => [cx + r * Math.cos(deg * Math.PI / 180), cy + r * Math.sin(deg * Math.PI / 180)];
  const arc = (a, b) => {
    const [x1, y1] = polar(a), [x2, y2] = polar(b);
    const large = b - a > 180 ? 1 : 0;
    return `M${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2}`;
  };
  const pct = Math.max(0, Math.min(100, value));
  const ndeg = start + (end - start) * (pct / 100);
  const [nx, ny] = polar(ndeg);

  const zone = (a, b, col) => <path d={arc(a, b)} stroke={col} strokeWidth="14" fill="none" />;
  const z1 = start + (end - start) * 0.5;
  const z2 = start + (end - start) * 0.8;

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: size, margin: '0 auto' }}>
      <svg viewBox={`0 0 ${w} ${h + 30}`} width="100%">
        {/* zones (low / mid / high) */}
        {zone(start, z1, 'color-mix(in oklab, var(--crit) 40%, var(--bg-elev-3))')}
        {zone(z1, z2,    'color-mix(in oklab, var(--warn) 45%, var(--bg-elev-3))')}
        {zone(z2, end,   'color-mix(in oklab, var(--ok)   45%, var(--bg-elev-3))')}
        {/* outer arc highlight */}
        <path d={arc(start, end)} stroke="var(--line-strong)" strokeWidth="1" fill="none" />
        {/* tick marks */}
        {Array.from({ length: 11 }).map((_, i) => {
          const t = start + ((end - start) * i) / 10;
          const [x1, y1] = [cx + (r - 8) * Math.cos(t * Math.PI / 180), cy + (r - 8) * Math.sin(t * Math.PI / 180)];
          const [x2, y2] = [cx + (r + 4) * Math.cos(t * Math.PI / 180), cy + (r + 4) * Math.sin(t * Math.PI / 180)];
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--fg-dim)" strokeWidth="1" />;
        })}
        {/* labels */}
        <text x={polar(start)[0]} y={polar(start)[1] + 16} fontSize="9" fontFamily="var(--f-mono)" fill="var(--fg-dim)" textAnchor="start">0</text>
        <text x={polar(end)[0]}   y={polar(end)[1] + 16}   fontSize="9" fontFamily="var(--f-mono)" fill="var(--fg-dim)" textAnchor="end">100</text>

        {/* needle */}
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={accent} strokeWidth="2.5" strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 4px color-mix(in oklab, ${accent} 80%, transparent))` }} />
        <circle cx={cx} cy={cy} r="6" fill={accent} stroke="var(--bg-elev-1)" strokeWidth="2" />

        {/* value text */}
        <text x={cx} y={cy + 24} fontSize="32" fontWeight="500" fontFamily="var(--f-mono)" fill="var(--fg)" textAnchor="middle">{value.toFixed(1)}<tspan fontSize="16" fill="var(--fg-dim)">%</tspan></text>
      </svg>
    </div>
  );
}

window.MasahiroCharts = { Sparkline, TimeSeries, StackedBar, Gauge, Ring, Dial };
