// app/plant3d.jsx — Three.js 3D view of the molding hall (orbit, click to select, status colors)
const { useEffect, useRef } = React;

function Plant3D({ machines, lines, tones, selected, line, onSelect }) {
  const mount = useRef(null);
  const latest = useRef({});
  latest.current = { tones, selected, line, onSelect };

  useEffect(() => {
    const T = window.THREE; const el = mount.current;
    const css = (v) => (getComputedStyle(document.querySelector('.app') || document.documentElement).getPropertyValue(v) || '#888').trim();
    const col = (v) => new T.Color(css(v));
    let w = el.clientWidth, h = el.clientHeight;

    const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); renderer.setSize(w, h);
    el.appendChild(renderer.domElement);
    const scene = new T.Scene(); scene.fog = new T.Fog(col('--bg'), 20, 44);
    const camera = new T.PerspectiveCamera(38, w / h, 0.1, 100); camera.position.set(10, 11, 13);
    const controls = new T.OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.4, 0); controls.enableDamping = true; controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI * 0.46; controls.minDistance = 7; controls.maxDistance = 26;

    scene.add(new T.AmbientLight(0xffffff, 0.55));
    const sun = new T.DirectionalLight(0xffffff, 0.9); sun.position.set(6, 12, 8); scene.add(sun);
    const rim = new T.DirectionalLight(col('--accent'), 0.5); rim.position.set(-8, 5, -6); scene.add(rim);

    const floor = new T.Mesh(new T.PlaneGeometry(22, 17), new T.MeshStandardMaterial({ color: col('--bg-elev-0'), roughness: 0.9 }));
    floor.rotation.x = -Math.PI / 2; scene.add(floor);
    const grid = new T.GridHelper(22, 22, col('--line-strong'), col('--line')); grid.position.y = 0.01; scene.add(grid);

    const label = (text, x, z) => {
      const c = document.createElement('canvas'); c.width = 256; c.height = 64;
      const g = c.getContext('2d'); g.font = '500 28px "IBM Plex Mono", monospace'; g.fillStyle = css('--fg-dim'); g.textAlign = 'center'; g.fillText(text, 128, 42);
      const s = new T.Sprite(new T.SpriteMaterial({ map: new T.CanvasTexture(c), transparent: true, depthWrite: false }));
      s.scale.set(2.4, 0.6, 1); s.position.set(x, 0.05, z); scene.add(s); return s;
    };

    const groups = {}; const pick = [];
    const rowZ = (i) => (i - (lines.length - 1) / 2) * 3.6;
    lines.forEach((l, li) => {
      const z = rowZ(li);
      const lane = new T.Mesh(new T.PlaneGeometry(14, 3), new T.MeshStandardMaterial({ color: col('--bg-elev-1'), roughness: 1 }));
      lane.rotation.x = -Math.PI / 2; lane.position.set(0, 0.02, z); scene.add(lane);
      label('LINE ' + l.id, -7.9, z);
      l.machines.forEach((id, mi) => {
        const g = new T.Group(); g.position.set(mi ? 3 : -3, 0, z); g.userData = { id, dim: 1 };
        const metal = (c, r = 0.55, m = 0.3) => new T.MeshStandardMaterial({ color: c, roughness: r, metalness: m, transparent: true });
        const base = new T.Mesh(new T.BoxGeometry(3.4, 0.8, 1.5), metal(col('--bg-elev-3'))); base.position.y = 0.4;
        const skin = new T.Mesh(new T.BoxGeometry(1.5, 0.9, 1.56), metal(col('--idle'), 0.4, 0.2)); skin.position.set(-0.9, 0.85, 0);
        const clamp = new T.Mesh(new T.BoxGeometry(1.1, 1.1, 1.3), metal(col('--bg-elev-2'))); clamp.position.set(-0.9, 1.35, 0);
        const barrel = new T.Mesh(new T.CylinderGeometry(0.28, 0.28, 1.7, 20), metal(col('--fg-muted'), 0.35, 0.7)); barrel.rotation.z = Math.PI / 2; barrel.position.set(0.9, 1.05, 0);
        const hopper = new T.Mesh(new T.ConeGeometry(0.4, 0.7, 4, 1, true), metal(col('--fg-dim'))); hopper.rotation.x = Math.PI; hopper.position.set(1.3, 1.65, 0);
        const mast = new T.Mesh(new T.CylinderGeometry(0.04, 0.04, 0.7, 8), metal(col('--line-strong'))); mast.position.set(-0.9, 2.2, 0);
        const beacon = new T.Mesh(new T.SphereGeometry(0.18, 20, 16), new T.MeshStandardMaterial({ color: col('--idle'), emissive: col('--idle'), emissiveIntensity: 0.8, transparent: true })); beacon.position.set(-0.9, 2.65, 0);
        const ring = new T.Mesh(new T.RingGeometry(2.1, 2.25, 48), new T.MeshBasicMaterial({ color: col('--accent'), side: T.DoubleSide, transparent: true, opacity: 0 })); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.05; ring.scale.set(1.05, 0.66, 1);
        [base, skin, clamp, barrel, hopper, mast, beacon].forEach((m) => { m.userData.id = id; g.add(m); pick.push(m); });
        g.add(ring); g.userData.skin = skin; g.userData.beacon = beacon; g.userData.ring = ring;
        scene.add(g); groups[id] = g;
      });
    });

    const toneVar = { ok: '--ok', warn: '--warn', crit: '--crit', info: '--info', idle: '--idle' };
    const ray = new T.Raycaster(); const ptr = new T.Vector2(); let down = null, hover = null;
    const setPtr = (e) => { const r = renderer.domElement.getBoundingClientRect(); ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ptr, camera); const hit = ray.intersectObjects(pick)[0]; return hit ? hit.object.userData.id : null; };
    const onDown = (e) => { down = [e.clientX, e.clientY]; };
    const onUp = (e) => { if (down && Math.hypot(e.clientX - down[0], e.clientY - down[1]) < 4) { const id = setPtr(e); if (id) latest.current.onSelect(id); } down = null; };
    const onMove = (e) => { hover = setPtr(e); renderer.domElement.style.cursor = hover ? 'pointer' : 'grab'; };
    const dom = renderer.domElement;
    dom.addEventListener('pointerdown', onDown); dom.addEventListener('pointerup', onUp); dom.addEventListener('pointermove', onMove);

    const ro = new ResizeObserver(() => { w = el.clientWidth; h = el.clientHeight; if (!w || !h) return; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); });
    ro.observe(el);

    const tmp = new T.Color(); let raf, t0 = performance.now();
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const t = (performance.now() - t0) / 1000; const L = latest.current;
      Object.values(groups).forEach((g) => {
        const id = g.userData.id; const tone = L.tones[id] || 'idle'; const c = col(toneVar[tone] || '--idle');
        const want = L.line === 'all' || lines.find((l) => l.id === L.line).machines.includes(id) ? 1 : 0.18;
        g.userData.dim += (want - g.userData.dim) * 0.12;
        const sk = g.userData.skin.material; sk.color.lerp(tmp.copy(c).multiplyScalar(0.55), 0.15);
        const bm = g.userData.beacon.material; bm.color.lerp(c, 0.2); bm.emissive.lerp(c, 0.2);
        bm.emissiveIntensity = tone === 'crit' ? 0.6 + 0.9 * Math.abs(Math.sin(t * 4)) : tone === 'warn' ? 0.7 + 0.4 * Math.sin(t * 2) : 0.9;
        const sel = L.selected === id; const rg = g.userData.ring.material;
        rg.opacity += ((sel ? 0.95 : hover === id ? 0.35 : 0) - rg.opacity) * 0.2;
        g.position.y = (sel ? 0.12 : 0) + (hover === id ? 0.05 : 0);
        g.traverse((o) => { if (o.material && o !== g.userData.ring) o.material.opacity = g.userData.dim; });
      });
      controls.update(); renderer.render(scene, camera);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf); ro.disconnect();
      dom.removeEventListener('pointerdown', onDown); dom.removeEventListener('pointerup', onUp); dom.removeEventListener('pointermove', onMove);
      scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) { o.material.map && o.material.map.dispose(); o.material.dispose(); } });
      controls.dispose(); renderer.dispose(); el.removeChild(dom);
    };
  }, []);

  return (
    <div ref={mount} style={{ position: 'relative', height: 540, width: '100%', borderRadius: 'var(--r-md)', overflow: 'hidden', background: 'radial-gradient(ellipse at 50% 30%, var(--bg-elev-2), var(--bg) 75%)' }}>
      <span className="muted-mono" style={{ position: 'absolute', left: 12, bottom: 10, pointerEvents: 'none' }}>Drag to orbit · Scroll to zoom · Click a press</span>
    </div>
  );
}

window.Plant3D = Plant3D;
