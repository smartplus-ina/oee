// app/main.jsx — App shell + tweaks
const { useState, useEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "variant": "modern",
  "page": "dashboard",
  "accent": "#2b6cff",
  "hero": "gauge",
  "ai": "drawer",
  "chart": "area"
}/*EDITMODE-END*/;

const ACCENTS = ['#2b6cff', '#22d3ee', '#f59e0b', '#34d399'];

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [aiOpen, setAiOpen] = useState(false);

  // apply accent to CSS var
  useEffect(() => {
    document.documentElement.style.setProperty('--accent', t.accent);
  }, [t.accent]);

  // route via tweak.page; deep-link via hash so sidebar can also navigate
  useEffect(() => {
    const h = (location.hash || '').replace('#', '');
    if (h && h !== t.page) setTweak('page', h);
  }, []);

  const navigate = (p) => {
    setTweak('page', p);
    history.replaceState(null, '', '#' + p);
    setAiOpen(false);
  };

  const openAI = () => {
    if (t.ai === 'drawer') setAiOpen(true);
    else setAiOpen(true); // for banner/card variants, drawer is still opened for "full details"
  };

  const { Sidebar, TopBar, AIDrawer } = window.MasahiroChrome;
  const Dashboard = window.MasahiroDashboard;
  const { Records, Analytics, Alarms, Reports, Schedule } = window.MasahiroPages;

  const PageMap = { settings: window.MasahiroSettings, plant: window.MasahiroPlant, dashboard: Dashboard, records: Records, analytics: Analytics, alarms: Alarms, reports: Reports, schedule: Schedule };
  const ActivePage = PageMap[t.page] || Dashboard;

  return (
    <div className="app" data-variant={t.variant}>
      <Sidebar page={t.page} onNavigate={navigate} />
      <TopBar page={t.page} onOpenAI={openAI} />
      <main className="app__main" key={t.page}>
        <ActivePage tweak={t} setTweak={setTweak} onOpenAI={openAI} />
      </main>

      {aiOpen && <AIDrawer page={t.page} onClose={() => setAiOpen(false)} />}

      <TweaksPanel>
        <TweakSection label="Variant" />
        <TweakRadio  label="Style"   value={t.variant} options={['modern', 'scada']}        onChange={(v) => setTweak('variant', v)} />
        <TweakColor  label="Accent"  value={t.accent}  options={ACCENTS}                     onChange={(v) => setTweak('accent', v)} />

        <TweakSection label="Page" />
        <TweakSelect label="View"    value={t.page}    options={['dashboard','records','analytics','alarms','reports','schedule','plant','settings']}
                                                                                            onChange={(v) => navigate(v)} />

        <TweakSection label="Components" />
        <TweakRadio  label="OEE hero" value={t.hero}   options={['gauge', 'number', 'ring', 'dial']}
                                                                                            onChange={(v) => setTweak('hero', v)} />
        <TweakRadio  label="AI panel" value={t.ai}     options={['drawer', 'banner', 'card']}
                                                                                            onChange={(v) => setTweak('ai', v)} />
        <TweakRadio  label="Chart"    value={t.chart}  options={['line', 'area', 'bars']}
                                                                                            onChange={(v) => setTweak('chart', v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
