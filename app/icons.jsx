// app/icons.jsx — tiny stroke icon set, monoline 16px viewBox.
// Designed to look industrial/utilitarian; avoids the lucide-cliché.

const sw = 1.5;
const I = ({ children, size = 16, ...rest }) => (
  <svg viewBox="0 0 16 16" width={size} height={size} fill="none"
       stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...rest}>
    {children}
  </svg>
);

const Icon = {
  Dashboard: (p) => <I {...p}><rect x="2" y="2" width="5" height="6" rx="1"/><rect x="9" y="2" width="5" height="3" rx="1"/><rect x="9" y="7" width="5" height="7" rx="1"/><rect x="2" y="10" width="5" height="4" rx="1"/></I>,
  Records:   (p) => <I {...p}><rect x="2.5" y="2" width="11" height="12" rx="1.5"/><path d="M5 5h6M5 8h6M5 11h4"/></I>,
  Analytics: (p) => <I {...p}><path d="M2 13V3M2 13h12"/><path d="M5 10l2.5-3 2 2L13 5"/></I>,
  Alarm:     (p) => <I {...p}><path d="M3 11.5V8a5 5 0 0 1 10 0v3.5L14 13H2l1-1.5z"/><path d="M6.5 13.5a1.5 1.5 0 0 0 3 0"/></I>,
  Report:    (p) => <I {...p}><path d="M3 1.5h7l3 3V14a.5.5 0 0 1-.5.5h-9A.5.5 0 0 1 3 14V1.5z"/><path d="M10 1.5V4.5h3"/><path d="M5.5 8h5M5.5 11h3"/></I>,
  Schedule:  (p) => <I {...p}><rect x="2" y="3" width="12" height="11" rx="1.5"/><path d="M2 6h12M5.5 1.5V4M10.5 1.5V4"/></I>,
  Settings:  (p) => <I {...p}><circle cx="8" cy="8" r="2"/><path d="M8 1v2M8 13v2M14 8h-2M3 8H1M12.5 3.5l-1.4 1.4M5 11l-1.5 1.5M12.5 12.5L11.1 11M5 5L3.5 3.5"/></I>,
  Plant:     (p) => <I {...p}><path d="M1.5 13.5V7l3.5 2.5V7L8 9V5l5 3v5.5h-12z"/><path d="M11 11h.01M9 11h.01"/></I>,

  Search:    (p) => <I {...p}><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14"/></I>,
  Bell:      (p) => <I {...p}><path d="M3 11.5V8a5 5 0 0 1 10 0v3.5L14 13H2l1-1.5z"/><path d="M6.5 13.5a1.5 1.5 0 0 0 3 0"/></I>,
  Help:      (p) => <I {...p}><circle cx="8" cy="8" r="6"/><path d="M6.5 6a1.5 1.5 0 0 1 3 0c0 1-1.5 1.3-1.5 2.5M8 11v.01"/></I>,
  Sparkle:   (p) => <I {...p}><path d="M8 1.5l1.6 4 4 1.6-4 1.6-1.6 4-1.6-4-4-1.6 4-1.6L8 1.5z"/><path d="M13 11.5l.7 1.6 1.6.7-1.6.7-.7 1.6-.7-1.6-1.6-.7 1.6-.7.7-1.6z" strokeWidth="1"/></I>,
  Chevron:   (p) => <I {...p}><path d="M6 4l4 4-4 4"/></I>,
  ChevDown:  (p) => <I {...p}><path d="M4 6l4 4 4-4"/></I>,
  Close:     (p) => <I {...p}><path d="M3.5 3.5l9 9M12.5 3.5l-9 9"/></I>,
  Filter:    (p) => <I {...p}><path d="M2 3h12l-4.5 5.5V13L6.5 14V8.5L2 3z"/></I>,
  Calendar:  (p) => <I {...p}><rect x="2" y="3" width="12" height="11" rx="1.5"/><path d="M2 6h12M5.5 1.5V4M10.5 1.5V4"/></I>,
  Download:  (p) => <I {...p}><path d="M8 2v8M5 7l3 3 3-3M2.5 13.5h11"/></I>,
  Expand:    (p) => <I {...p}><path d="M9 2h5v5M14 2L9 7M7 14H2V9M2 14l5-5"/></I>,
  Play:      (p) => <I {...p}><path d="M4.5 3v10l8-5-8-5z"/></I>,
  Refresh:   (p) => <I {...p}><path d="M14 8a6 6 0 1 1-1.7-4.2L14 5"/><path d="M14 2v3h-3"/></I>,
  Cog:       (p) => <I {...p}><circle cx="8" cy="8" r="1.8"/><path d="M8 1.5v2M8 12.5v2M2.5 8h-1M14.5 8h-1M3.8 3.8l1.4 1.4M10.8 10.8l1.4 1.4M3.8 12.2l1.4-1.4M10.8 5.2l1.4-1.4"/></I>,
  Plug:      (p) => <I {...p}><path d="M5 1.5v3M11 1.5v3"/><rect x="3.5" y="4.5" width="9" height="4" rx="1"/><path d="M8 8.5v3M5.5 14.5h5"/></I>,
  Up:        (p) => <I {...p}><path d="M8 12V4M4 8l4-4 4 4"/></I>,
  Down:      (p) => <I {...p}><path d="M8 4v8M4 8l4 4 4-4"/></I>,
  Dot:       (p) => <I {...p}><circle cx="8" cy="8" r="2" fill="currentColor"/></I>,
  Drag:      (p) => <I {...p}><circle cx="6" cy="4" r=".7" fill="currentColor"/><circle cx="10" cy="4" r=".7" fill="currentColor"/><circle cx="6" cy="8" r=".7" fill="currentColor"/><circle cx="10" cy="8" r=".7" fill="currentColor"/><circle cx="6" cy="12" r=".7" fill="currentColor"/><circle cx="10" cy="12" r=".7" fill="currentColor"/></I>,
  Check:     (p) => <I {...p}><path d="M3 8.5l3.5 3.5L13 5"/></I>,
  PDF:       (p) => <I {...p}><path d="M3 1.5h7l3 3V14a.5.5 0 0 1-.5.5h-9A.5.5 0 0 1 3 14V1.5z"/><path d="M10 1.5V4.5h3"/><text x="5" y="12" fontFamily="monospace" fontSize="3.5" fill="currentColor" stroke="none">PDF</text></I>,
  XLS:       (p) => <I {...p}><path d="M3 1.5h7l3 3V14a.5.5 0 0 1-.5.5h-9A.5.5 0 0 1 3 14V1.5z"/><path d="M10 1.5V4.5h3"/><text x="5" y="12" fontFamily="monospace" fontSize="3.5" fill="currentColor" stroke="none">XLS</text></I>,
};

window.Icon = Icon;
