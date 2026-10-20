// app/data.jsx — Lorem-style placeholder data for an injection-molding plant.
// All numbers are illustrative; values stay stable across renders.

const MACHINES = [
  { id: 'IMM-01', name: 'Press IMM-01',  type: '180T Hydraulic',  line: 'Line A', status: 'running',  oee: 86.4, cycle: 38, target: 1200, output: 1064, sku: 'PLT-A14' },
  { id: 'IMM-02', name: 'Press IMM-02',  type: '220T Hydraulic',  line: 'Line A', status: 'running',  oee: 79.2, cycle: 42, target: 1100, output:  912, sku: 'CAP-22B' },
  { id: 'IMM-03', name: 'Press IMM-03',  type: '350T Electric',   line: 'Line B', status: 'warning',  oee: 64.1, cycle: 58, target:  900, output:  541, sku: 'CTR-09'  },
  { id: 'IMM-04', name: 'Press IMM-04',  type: '350T Electric',   line: 'Line B', status: 'down',     oee: 0.0,  cycle: 0,  target:  900, output:  214, sku: 'CTR-09'  },
  { id: 'IMM-05', name: 'Press IMM-05',  type: '500T Hybrid',     line: 'Line C', status: 'running',  oee: 82.7, cycle: 64, target:  720, output:  601, sku: 'HSG-K3'  },
  { id: 'IMM-06', name: 'Press IMM-06',  type: '500T Hybrid',     line: 'Line C', status: 'idle',     oee: 0.0,  cycle: 0,  target:  720, output:    0, sku: '—'       },
  { id: 'IMM-07', name: 'Press IMM-07',  type: '750T Hydraulic',  line: 'Line D', status: 'running',  oee: 91.0, cycle: 78, target:  540, output:  498, sku: 'BMP-V2'  },
  { id: 'IMM-08', name: 'Press IMM-08',  type: '750T Hydraulic',  line: 'Line D', status: 'warning',  oee: 71.3, cycle: 81, target:  540, output:  386, sku: 'BMP-V2'  },
];

const SHIFTS = [
  { id: 'A', name: 'Shift A — 06:00 → 14:00', oee: 81.4, lead: 'M. Tanaka' },
  { id: 'B', name: 'Shift B — 14:00 → 22:00', oee: 76.9, lead: 'R. Okafor' },
  { id: 'C', name: 'Shift C — 22:00 → 06:00', oee: 72.1, lead: 'L. Mendoza' },
];

const ALARMS = [
  { id: 'AL-2041', severity: 'crit', machine: 'IMM-04', code: 'E-217', title: 'Hydraulic pressure below threshold', age: '00:12:04', status: 'active' },
  { id: 'AL-2040', severity: 'warn', machine: 'IMM-03', code: 'W-104', title: 'Mold temperature drift +6.2°C',         age: '00:24:11', status: 'active' },
  { id: 'AL-2039', severity: 'warn', machine: 'IMM-08', code: 'W-188', title: 'Cycle time exceeds standard by 14%',     age: '00:38:50', status: 'ack'    },
  { id: 'AL-2038', severity: 'info', machine: 'IMM-02', code: 'I-002', title: 'Material hopper level low (24%)',        age: '01:02:33', status: 'active' },
  { id: 'AL-2037', severity: 'crit', machine: 'IMM-05', code: 'E-301', title: 'Robot arm collision detected — recovered',age: '01:48:09', status: 'cleared'},
  { id: 'AL-2036', severity: 'warn', machine: 'IMM-07', code: 'W-052', title: 'Cooling water flow reduced',             age: '02:14:55', status: 'active' },
  { id: 'AL-2035', severity: 'info', machine: 'IMM-01', code: 'I-011', title: 'Operator override engaged for mold change',age:'03:01:02', status: 'cleared'},
];

const DOWNTIME = [
  { reason: 'Mold change',          minutes: 124, share: 0.34 },
  { reason: 'Material refill',      minutes:  68, share: 0.19 },
  { reason: 'Unplanned breakdown',  minutes:  52, share: 0.14 },
  { reason: 'Setup & adjustment',   minutes:  47, share: 0.13 },
  { reason: 'Quality check / scrap',minutes:  38, share: 0.10 },
  { reason: 'Other / breaks',       minutes:  35, share: 0.10 },
];

// 24h OEE series (one point per hour).
const OEE_24H = [62, 68, 71, 74, 78, 82, 85, 86, 84, 81, 77, 72, 70, 73, 76, 80, 83, 81, 79, 75, 71, 68, 65, 67];
const AVL_24H = [78, 80, 82, 84, 88, 90, 92, 91, 89, 87, 85, 82, 80, 83, 86, 89, 90, 88, 86, 83, 80, 78, 75, 77];
const PRF_24H = [88, 89, 91, 92, 93, 94, 95, 94, 93, 91, 89, 88, 86, 88, 90, 91, 93, 92, 90, 88, 86, 84, 83, 85];
const QLT_24H = [96, 97, 97, 98, 98, 98, 99, 99, 98, 98, 97, 97, 96, 96, 97, 98, 98, 98, 97, 97, 96, 96, 95, 96];

// 7-day series for analytics.
const OEE_7D = [
  { d: 'Mon', oee: 74.1, a: 86, p: 89, q: 96 },
  { d: 'Tue', oee: 78.6, a: 88, p: 91, q: 97 },
  { d: 'Wed', oee: 76.4, a: 84, p: 92, q: 98 },
  { d: 'Thu', oee: 81.0, a: 89, p: 93, q: 98 },
  { d: 'Fri', oee: 83.2, a: 91, p: 92, q: 99 },
  { d: 'Sat', oee: 79.1, a: 87, p: 91, q: 99 },
  { d: 'Sun', oee: 78.4, a: 86, p: 92, q: 97 },
];

const SCHEDULE_TODAY = [
  { time: '06:00', machine: 'IMM-01', kind: 'production', label: 'PLT-A14 run',       hours: 8 },
  { time: '06:00', machine: 'IMM-02', kind: 'production', label: 'CAP-22B run',       hours: 4 },
  { time: '10:00', machine: 'IMM-02', kind: 'changeover',label: 'Mold change → CAP-30A', hours: 1 },
  { time: '11:00', machine: 'IMM-02', kind: 'production', label: 'CAP-30A run',       hours: 5 },
  { time: '06:00', machine: 'IMM-03', kind: 'production', label: 'CTR-09 run',        hours: 6 },
  { time: '12:00', machine: 'IMM-03', kind: 'maintenance',label: 'PM-32 hydraulic check', hours: 2 },
  { time: '14:00', machine: 'IMM-03', kind: 'production', label: 'CTR-09 run',        hours: 4 },
  { time: '06:00', machine: 'IMM-04', kind: 'maintenance',label: 'Repair: E-217 pressure', hours: 4 },
  { time: '10:00', machine: 'IMM-04', kind: 'production', label: 'CTR-09 run',        hours: 8 },
  { time: '06:00', machine: 'IMM-05', kind: 'production', label: 'HSG-K3 run',        hours: 12},
  { time: '06:00', machine: 'IMM-06', kind: 'idle',       label: '— available —',     hours: 18 },
  { time: '06:00', machine: 'IMM-07', kind: 'production', label: 'BMP-V2 run',        hours: 18 },
  { time: '06:00', machine: 'IMM-08', kind: 'production', label: 'BMP-V2 run',        hours: 14 },
  { time: '20:00', machine: 'IMM-08', kind: 'maintenance',label: 'Cooling line flush',hours: 2 },
];

const REPORTS_LIST = [
  { id: 'RPT-0241', period: 'Week 21 · May 18 – 24',  type: 'Weekly OEE',          owner: 'M. Tanaka',  status: 'final' },
  { id: 'RPT-0240', period: 'Week 20 · May 11 – 17',  type: 'Weekly OEE',          owner: 'M. Tanaka',  status: 'final' },
  { id: 'RPT-0239', period: 'Apr 2026',               type: 'Monthly executive',   owner: 'S. Aronova', status: 'final' },
  { id: 'RPT-0238', period: 'Line B · Apr 18 – 24',   type: 'Downtime deep-dive',  owner: 'R. Okafor',  status: 'draft' },
  { id: 'RPT-0237', period: 'Q1 2026',                type: 'Quarterly review',    owner: 'S. Aronova', status: 'final' },
];

// Records table for the OEE Record page.
const RECORDS = (() => {
  const rows = [];
  const machines = ['IMM-01','IMM-02','IMM-03','IMM-04','IMM-05','IMM-06','IMM-07','IMM-08'];
  const shifts = ['A','B','C'];
  const seed = (n) => Math.abs(Math.sin(n * 12.9898) * 43758.5453) % 1;
  let id = 4200;
  for (let d = 24; d >= 18; d--) {
    machines.forEach((m, mi) => {
      shifts.forEach((s, si) => {
        const r = seed(d * 31 + mi * 7 + si);
        const oee  = +(55 + r * 38).toFixed(1);
        const avl  = +(75 + ((r * 100) % 22)).toFixed(1);
        const prf  = +(80 + ((r * 100) % 18)).toFixed(1);
        const qlt  = +(94 + ((r * 100) % 6)).toFixed(1);
        const good = Math.floor(300 + r * 900);
        const bad  = Math.floor(2 + r * 30);
        rows.push({
          id: 'R-' + (id++),
          date: `2026-05-${String(d).padStart(2,'0')}`,
          shift: s,
          machine: m,
          oee, avl, prf, qlt,
          good, bad,
          down: Math.floor(10 + r * 90),
        });
      });
    });
  }
  return rows;
})();

window.MasahiroData = {
  MACHINES, SHIFTS, ALARMS, DOWNTIME,
  OEE_24H, AVL_24H, PRF_24H, QLT_24H,
  OEE_7D, SCHEDULE_TODAY, REPORTS_LIST, RECORDS,
};
