/* ============================================================
   script.js — AI Smart City
   ============================================================ */

/* ============================================================
   1) HERO 3D CITY
   ============================================================ */
(function initHeroCity() {
  const container = document.getElementById('hero-canvas-container');
  if (!container || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xeaf0ff, 40, 110);

  const camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 14, 42);
  camera.lookAt(0, 6, 0);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.85));

  const sun = new THREE.DirectionalLight(0xffffff, 0.9);
  sun.position.set(20, 35, 20);
  scene.add(sun);

  const fill = new THREE.DirectionalLight(0x8b5cf6, 0.35);
  fill.position.set(-25, 20, -15);
  scene.add(fill);

  const rim = new THREE.PointLight(0x4f6bff, 0.6, 120);
  rim.position.set(0, 20, -30);
  scene.add(rim);

  // Ground grid
  const groundGeo = new THREE.PlaneGeometry(200, 200, 40, 40);
  const groundMat = new THREE.MeshBasicMaterial({
    color: 0xdfe7ff,
    transparent: true,
    opacity: 0.35,
    wireframe: true
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  // City
  const cityGroup = new THREE.Group();
  scene.add(cityGroup);

  const palette = [
    0xc7d4ff, 0xd9e2ff, 0xb9c7f5, 0xdcd0ff, 0xc9b8f5,
    0xa9c7ff, 0xd5e2ff, 0xe4d9ff
  ];

  const grid = 9;
  const gap = 4.2;
  const half = (grid * gap) / 2;
  const buildings = [];

  for (let x = 0; x < grid; x++) {
    for (let z = 0; z < grid; z++) {
      const centerDist = Math.abs(x - (grid - 1) / 2) + Math.abs(z - (grid - 1) / 2);
      if (centerDist < 2) continue;

      const w = 1.6 + Math.random() * 1.4;
      const d = 1.6 + Math.random() * 1.4;
      const h = 3 + Math.random() * 14 + Math.max(0, (4 - centerDist) * 1.2);

      const geo = new THREE.BoxGeometry(w, h, d);
      const color = palette[Math.floor(Math.random() * palette.length)];
      const mat = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.4,
        metalness: 0.15,
        transparent: true,
        opacity: 0.94
      });
      const box = new THREE.Mesh(geo, mat);
      const px = x * gap - half + (Math.random() - 0.5) * 0.5;
      const pz = z * gap - half + (Math.random() - 0.5) * 0.5;
      box.position.set(px, h / 2, pz);
      cityGroup.add(box);
      buildings.push({ mesh: box, baseY: h / 2 });

      // Glowing top edge
      const edgeGeo = new THREE.BoxGeometry(w * 1.02, 0.08, d * 1.02);
      const edgeMat = new THREE.MeshBasicMaterial({
        color: 0x6b8cff,
        transparent: true,
        opacity: 0.9
      });
      const edge = new THREE.Mesh(edgeGeo, edgeMat);
      edge.position.set(px, h + 0.04, pz);
      cityGroup.add(edge);

      // Windows
      const windows = Math.floor(h / 1.5);
      for (let i = 0; i < windows; i++) {
        if (Math.random() > 0.55) continue;
        const winGeo = new THREE.PlaneGeometry(w * 0.55, 0.14);
        const winMat = new THREE.MeshBasicMaterial({
          color: Math.random() > 0.5 ? 0xfff2b0 : 0xb0e0ff,
          transparent: true,
          opacity: 0.85
        });
        const win = new THREE.Mesh(winGeo, winMat);
        const side = Math.floor(Math.random() * 4);
        const y = 1 + i * 1.5;
        const off = w / 2 + 0.02;
        if (side === 0) { win.position.set(px + off, y, pz); win.rotation.y = Math.PI / 2; }
        else if (side === 1) { win.position.set(px - off, y, pz); win.rotation.y = -Math.PI / 2; }
        else if (side === 2) { win.position.set(px, y, pz + off); }
        else { win.position.set(px, y, pz - off); win.rotation.y = Math.PI; }
        cityGroup.add(win);
      }
    }
  }

  // Vehicles
  const vehicleGroup = new THREE.Group();
  scene.add(vehicleGroup);
  const vehicles = [];
  const roadY = 0.35;

  [-half - 1.5, half + 1.5].forEach((z, idx) => {
    for (let i = 0; i < 5; i++) {
      const carGeo = new THREE.BoxGeometry(0.9, 0.45, 0.5);
      const carMat = new THREE.MeshStandardMaterial({
        color: idx === 0 ? 0x4f6bff : 0x8b5cf6,
        emissive: idx === 0 ? 0x2b3a99 : 0x4c2f99,
        emissiveIntensity: 0.5,
        roughness: 0.35
      });
      const car = new THREE.Mesh(carGeo, carMat);
      car.position.set(-half - 3 + i * 6 + Math.random() * 3, roadY, z);
      vehicleGroup.add(car);
      vehicles.push({
        mesh: car, axis: 'x',
        speed: (idx === 0 ? 1 : -1) * (0.045 + Math.random() * 0.03),
        min: -half - 6, max: half + 6
      });
    }
  });

  [-half - 1.5, half + 1.5].forEach((x, idx) => {
    for (let i = 0; i < 5; i++) {
      const carGeo = new THREE.BoxGeometry(0.5, 0.45, 0.9);
      const carMat = new THREE.MeshStandardMaterial({
        color: idx === 0 ? 0x06b6d4 : 0x10b981,
        emissive: idx === 0 ? 0x064e5c : 0x065f46,
        emissiveIntensity: 0.5,
        roughness: 0.35
      });
      const car = new THREE.Mesh(carGeo, carMat);
      car.position.set(x, roadY, -half - 3 + i * 6 + Math.random() * 3);
      vehicleGroup.add(car);
      vehicles.push({
        mesh: car, axis: 'z',
        speed: (idx === 0 ? 1 : -1) * (0.045 + Math.random() * 0.03),
        min: -half - 6, max: half + 6
      });
    }
  });

  // Street lights
  const streetLights = [];
  for (let i = 0; i < 14; i++) {
    const poleGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.4, 6);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x9aa8c7 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.set(-half + i * (grid * gap / 14), 1.2, -half - 2.6);
    scene.add(pole);

    const bulbGeo = new THREE.SphereGeometry(0.22, 10, 10);
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0x6b8cff });
    const bulb = new THREE.Mesh(bulbGeo, bulbMat);
    bulb.position.set(pole.position.x, 2.45, pole.position.z);
    scene.add(bulb);
    streetLights.push(bulb);
  }

  // Drones
  const drones = [];
  for (let i = 0; i < 6; i++) {
    const drone = new THREE.Group();

    const bodyGeo = new THREE.SphereGeometry(0.28, 10, 10);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x4f6bff,
      emissiveIntensity: 0.6,
      roughness: 0.3
    });
    drone.add(new THREE.Mesh(bodyGeo, bodyMat));

    for (let r = 0; r < 4; r++) {
      const armGeo = new THREE.BoxGeometry(0.55, 0.03, 0.05);
      const armMat = new THREE.MeshBasicMaterial({ color: 0x8899cc });
      const arm = new THREE.Mesh(armGeo, armMat);
      arm.rotation.y = (r * Math.PI) / 2;
      drone.add(arm);
    }

    const glowGeo = new THREE.SphereGeometry(0.4, 8, 8);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x4f6bff,
      transparent: true,
      opacity: 0.22
    });
    drone.add(new THREE.Mesh(glowGeo, glowMat));

    drone.position.set(
      (Math.random() - 0.5) * 35,
      10 + Math.random() * 8,
      (Math.random() - 0.5) * 35
    );
    scene.add(drone);
    drones.push({
      mesh: drone,
      t: Math.random() * Math.PI * 2,
      radius: 10 + Math.random() * 12,
      speed: 0.25 + Math.random() * 0.25,
      height: drone.position.y,
      centerX: (Math.random() - 0.5) * 6,
      centerZ: (Math.random() - 0.5) * 6
    });
  }

  // Particles
  const particleCount = 700;
  const particlesGeo = new THREE.BufferGeometry();
  const posArr = new Float32Array(particleCount * 3);
  const particleData = [];
  for (let i = 0; i < particleCount; i++) {
    posArr[i * 3] = (Math.random() - 0.5) * 90;
    posArr[i * 3 + 1] = 2 + Math.random() * 40;
    posArr[i * 3 + 2] = (Math.random() - 0.5) * 90;
    particleData.push({ speed: 0.02 + Math.random() * 0.05 });
  }
  particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
  const particlesMat = new THREE.PointsMaterial({
    color: 0x6b8cff,
    size: 0.28,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const particles = new THREE.Points(particlesGeo, particlesMat);
  scene.add(particles);

  // Mouse parallax
  let mouseX = 0, mouseY = 0;
  let targetX = 0, targetY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = (e.clientY / window.innerHeight) * 2 - 1;
  });

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    cityGroup.rotation.y += 0.0009;

    buildings.forEach((b, i) => {
      b.mesh.position.y = b.baseY + Math.sin(t * 0.7 + i) * 0.08;
    });

    vehicles.forEach(v => {
      if (v.axis === 'x') {
        v.mesh.position.x += v.speed;
        if (v.mesh.position.x > v.max) v.mesh.position.x = v.min;
        if (v.mesh.position.x < v.min) v.mesh.position.x = v.max;
      } else {
        v.mesh.position.z += v.speed;
        if (v.mesh.position.z > v.max) v.mesh.position.z = v.min;
        if (v.mesh.position.z < v.min) v.mesh.position.z = v.max;
      }
    });

    streetLights.forEach((bulb, i) => {
      const pulse = 0.5 + 0.5 * Math.sin(t * 2 + i * 0.5);
      bulb.material.color.setHSL(0.62, 0.85, 0.55 + pulse * 0.25);
      bulb.scale.setScalar(0.85 + pulse * 0.3);
    });

    drones.forEach(d => {
      d.t += 0.01 * d.speed;
      d.mesh.position.x = d.centerX + Math.cos(d.t) * d.radius;
      d.mesh.position.z = d.centerZ + Math.sin(d.t) * d.radius;
      d.mesh.position.y = d.height + Math.sin(d.t * 2) * 1.2;
      d.mesh.rotation.y = -d.t + Math.PI / 2;
    });

    const pos = particles.geometry.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3 + 1] += particleData[i].speed;
      if (pos[i * 3 + 1] > 45) pos[i * 3 + 1] = 2;
    }
    particles.geometry.attributes.position.needsUpdate = true;

    targetX += (mouseX * 3.5 - targetX) * 0.04;
    targetY += (-mouseY * 2.2 - targetY) * 0.04;

    camera.position.x = targetX;
    camera.position.y = 14 + targetY;
    camera.lookAt(0, 6, 0);

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();

/* ============================================================
   2) INTERACTIVE 3D CITY MAP
   ============================================================ */
(function initCityMap() {
  const container = document.getElementById('citymap-canvas');
  if (!container || typeof THREE === 'undefined') return;

  const w = container.clientWidth;
  const h = container.clientHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 200);
  camera.position.set(0, 16, 22);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(w, h);
  container.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.9));
  const light = new THREE.DirectionalLight(0xffffff, 0.9);
  light.position.set(10, 20, 10);
  scene.add(light);

  const gridHelper = new THREE.GridHelper(30, 15, 0x4f6bff, 0xd8e0f7);
  gridHelper.position.y = -0.5;
  scene.add(gridHelper);

  const planeGeo = new THREE.PlaneGeometry(30, 30);
  const planeMat = new THREE.MeshBasicMaterial({
    color: 0xf5f8ff,
    transparent: true,
    opacity: 0.7
  });
  const plane = new THREE.Mesh(planeGeo, planeMat);
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = -0.5;
  scene.add(plane);

  const zoneInfo = {
    downtown: {
      name: 'Downtown Core', tag: 'ZONE 01', color: 0x4f6bff, pos: [0, 0],
      desc: 'Adaptive traffic AI and connected intersections dynamically re-route vehicles to keep the central district flowing at peak hours.',
      s1: '98%', s1l: 'Flow Efficiency', s2: '42%', s2l: 'Congestion Drop'
    },
    industrial: {
      name: 'Industrial Belt', tag: 'ZONE 02', color: 0x8b5cf6, pos: [-6, -4],
      desc: 'Self-balancing microgrid and demand forecasting cut peak load and integrate rooftop solar across the entire industrial corridor.',
      s1: '87%', s1l: 'Grid Balance', s2: '38%', s2l: 'Peak Reduction'
    },
    residential: {
      name: 'Residential District', tag: 'ZONE 03', color: 0x06b6d4, pos: [6, 4],
      desc: 'Predictive safety analytics and connected community sensors keep neighborhoods secure while preserving privacy.',
      s1: '91%', s1l: 'Safety Score', s2: '27%', s2l: 'Response Time ↓'
    },
    waterfront: {
      name: 'Waterfront Hub', tag: 'ZONE 04', color: 0x10b981, pos: [6, -5],
      desc: 'Multi-modal transit and smart waste collection meet at the waterfront to keep the busiest hub in the city flowing smoothly.',
      s1: '89%', s1l: 'Transit Punctuality', s2: '33%', s2l: 'Waste Emissions ↓'
    }
  };

  const zones = {};
  const zoneMeshes = [];

  Object.keys(zoneInfo).forEach(key => {
    const info = zoneInfo[key];
    const [gx, gz] = info.pos;

    const ringGeo = new THREE.RingGeometry(2.6, 3.2, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: info.color, transparent: true, opacity: 0.55, side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(gx, -0.48, gz);
    ring.userData.zoneKey = key;
    scene.add(ring);

    const coreGeo = new THREE.CylinderGeometry(1.6, 1.6, 0.6, 24);
    const coreMat = new THREE.MeshStandardMaterial({
      color: info.color, emissive: info.color, emissiveIntensity: 0.5,
      transparent: true, opacity: 0.85, roughness: 0.3
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.set(gx, 0, gz);
    core.userData.zoneKey = key;
    scene.add(core);

    for (let i = 0; i < 6; i++) {
      const bh = 0.6 + Math.random() * 2.2;
      const bw = 0.5 + Math.random() * 0.5;
      const bg = new THREE.BoxGeometry(bw, bh, bw);
      const bm = new THREE.MeshStandardMaterial({
        color: info.color, emissive: info.color, emissiveIntensity: 0.18, roughness: 0.5
      });
      const b = new THREE.Mesh(bg, bm);
      b.position.set(gx + (Math.random() - 0.5) * 2.4, bh / 2, gz + (Math.random() - 0.5) * 2.4);
      b.userData.zoneKey = key;
      scene.add(b);
      zoneMeshes.push(b);
    }

    zones[key] = { ring, core };
    zoneMeshes.push(ring, core);
  });

  const pulses = [];
  function spawnPulse(key) {
    const info = zoneInfo[key];
    const geo = new THREE.RingGeometry(3.2, 3.4, 48);
    const mat = new THREE.MeshBasicMaterial({
      color: info.color, transparent: true, opacity: 0.8, side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(geo, mat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(info.pos[0], -0.46, info.pos[1]);
    scene.add(ring);
    pulses.push({ mesh: ring, scale: 1 });
  }

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  function onClick(e) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(zoneMeshes, true);
    if (hits.length) {
      const key = hits[0].object.userData.zoneKey;
      if (key) selectZone(key);
    }
  }
  renderer.domElement.addEventListener('click', onClick);
  renderer.domElement.style.cursor = 'pointer';

  const zoneBtns = document.querySelectorAll('.zone-btn');
  const zoneTag = document.getElementById('zoneTag');
  const zoneTitle = document.getElementById('zoneTitle');
  const zoneDesc = document.getElementById('zoneDesc');
  const zoneStat1 = document.getElementById('zoneStat1');
  const zoneStat1Label = document.getElementById('zoneStat1Label');
  const zoneStat2 = document.getElementById('zoneStat2');
  const zoneStat2Label = document.getElementById('zoneStat2Label');

  function selectZone(key) {
    const info = zoneInfo[key];
    if (!info) return;
    zoneTag.textContent = info.tag;
    zoneTitle.textContent = info.name;
    zoneDesc.textContent = info.desc;
    zoneStat1.textContent = info.s1;
    zoneStat1Label.textContent = info.s1l;
    zoneStat2.textContent = info.s2;
    zoneStat2Label.textContent = info.s2l;

    zoneBtns.forEach(b => b.classList.toggle('active', b.dataset.zone === key));

    Object.keys(zones).forEach(k => {
      const z = zones[k];
      const isActive = k === key;
      z.ring.material.opacity = isActive ? 0.95 : 0.4;
      z.core.material.emissiveIntensity = isActive ? 1.1 : 0.4;
      z.core.scale.setScalar(isActive ? 1.15 : 1);
    });

    spawnPulse(key);
  }

  zoneBtns.forEach(btn => {
    btn.addEventListener('click', () => selectZone(btn.dataset.zone));
  });

  selectZone('downtown');

  function animateMap() {
    requestAnimationFrame(animateMap);
    scene.rotation.y += 0.0008;
    pulses.forEach((p, i) => {
      p.scale += 0.012;
      p.mesh.scale.setScalar(p.scale);
      p.mesh.material.opacity = Math.max(0, 0.8 - p.scale * 0.15);
      if (p.scale > 3) {
        scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        p.mesh.material.dispose();
        pulses.splice(i, 1);
      }
    });
    renderer.render(scene, camera);
  }
  animateMap();

  window.addEventListener('resize', () => {
    const nw = container.clientWidth;
    const nh = container.clientHeight;
    camera.aspect = nw / nh;
    camera.updateProjectionMatrix();
    renderer.setSize(nw, nh);
  });
})();

/* ============================================================
   3) DASHBOARD
   ============================================================ */
(function initDashboard() {
  const trafficVal = document.getElementById('trafficVal');
  const energyVal = document.getElementById('energyVal');
  const airVal = document.getElementById('airVal');
  const popVal = document.getElementById('popVal');
  const transportVal = document.getElementById('transportVal');
  const trafficBar = document.getElementById('trafficBar');
  const energyBar = document.getElementById('energyBar');
  const airBar = document.getElementById('airBar');
  const popSpark = document.getElementById('popSparkline');
  const transportSpark = document.getElementById('transportSparkline');

  if (!trafficVal) return;

  function animateValue(el, target, duration = 1400) {
    const start = performance.now();
    function step(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString();
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  animateValue(trafficVal, 92);
  animateValue(energyVal, 78);
  animateValue(airVal, 42);
  animateValue(popVal, 2840000);
  animateValue(transportVal, 64);

  setTimeout(() => {
    trafficBar.style.width = '92%';
    energyBar.style.width = '78%';
    airBar.style.width = '42%';
  }, 200);

  setInterval(() => {
    const t = 85 + Math.round(Math.random() * 12);
    const e = 72 + Math.round(Math.random() * 12);
    const a = 35 + Math.round(Math.random() * 20);
    const tr = 58 + Math.round(Math.random() * 14);
    trafficVal.textContent = t;
    energyVal.textContent = e;
    airVal.textContent = a;
    transportVal.textContent = tr;
    trafficBar.style.width = t + '%';
    energyBar.style.width = e + '%';
    airBar.style.width = a + '%';
  }, 3200);

  function buildSparkline(container, variance, color) {
    if (!container) return;
    const w = container.clientWidth || 400;
    const h = 70;
    const points = 24;
    let d = '';
    for (let i = 0; i < points; i++) {
      const x = (i / (points - 1)) * w;
      const y = h / 2 + Math.sin(i * 0.5) * variance + (Math.random() - 0.5) * (variance * 0.6);
      d += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1) + ' ';
    }
    const area = d + `L${w},${h} L0,${h} Z`;
    container.innerHTML = `
      <svg width="100%" height="${h}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
        <defs>
          <linearGradient id="g-${color.replace('#','')}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${color}" stop-opacity="0.35"/>
            <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <path d="${area}" fill="url(#g-${color.replace('#','')})"/>
        <path d="${d}" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
  }

  buildSparkline(popSpark, 14, '#06b6d4');
  buildSparkline(transportSpark, 12, '#f59e0b');

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      buildSparkline(popSpark, 14, '#06b6d4');
      buildSparkline(transportSpark, 12, '#f59e0b');
    }, 250);
  });

  setInterval(() => {
    buildSparkline(popSpark, 14, '#06b6d4');
    buildSparkline(transportSpark, 12, '#f59e0b');
  }, 5000);
})();

/* ============================================================
   4) CIRCULAR PROGRESS
   ============================================================ */
(function initCircularStats() {
  const circles = document.querySelectorAll('.circular-fill');
  const nums = document.querySelectorAll('.circle-num');
  if (!circles.length) return;

  const circumference = 2 * Math.PI * 52;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const circle = entry.target;
      const percent = parseInt(circle.dataset.percent, 10) || 0;
      const offset = circumference - (percent / 100) * circumference;
      circle.style.strokeDasharray = circumference;
      circle.style.strokeDashoffset = offset;
      observer.unobserve(circle);
    });
  }, { threshold: 0.4 });

  circles.forEach(c => {
    c.style.strokeDasharray = circumference;
    c.style.strokeDashoffset = circumference;
    observer.observe(c);
  });

  const numObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10) || 0;
      const start = performance.now();
      const dur = 1600;
      function step(now) {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased);
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
      numObserver.unobserve(el);
    });
  }, { threshold: 0.4 });

  nums.forEach(n => numObserver.observe(n));
})();

/* ============================================================
   5) STAT COUNTERS
   ============================================================ */
(function initStatCounters() {
  const counters = document.querySelectorAll('.stat-counter');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10) || 0;
      const start = performance.now();
      const dur = 1800;
      function step(now) {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased);
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
})();

/* ============================================================
   6) REVEAL ON SCROLL
   ============================================================ */
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        setTimeout(() => el.classList.add('in-view'), Math.min(i * 60, 300));
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.12 });

  els.forEach(el => observer.observe(el));
})();

/* ============================================================
   7) NAVBAR
   ============================================================ */
(function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    if (navbar) {
      navbar.style.boxShadow = window.scrollY > 40
        ? '0 6px 24px rgba(79, 107, 255, 0.10)'
        : 'none';
    }

    let current = '';
    sections.forEach(section => {
      if (window.scrollY >= section.offsetTop - 120) {
        current = section.getAttribute('id');
      }
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  }, { passive: true });
})();

/* ============================================================
   8) SMOOTH SCROLL
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const id = this.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const collapse = document.querySelector('.navbar-collapse');
    if (collapse && collapse.classList.contains('show')) {
      new bootstrap.Collapse(collapse).hide();
    }
  });
});

/* ============================================================
   9) FAB toggle
   ============================================================ */
(function initFab() {
  const main = document.getElementById('fabMain');
  const options = document.getElementById('fabOptions');
  if (!main || !options) return;

  function closeFab() {
    options.classList.remove('show');
    main.classList.remove('active');
    main.setAttribute('aria-expanded', 'false');
    main.innerHTML = '<i class="fas fa-headset"></i>';
  }
  function openFab() {
    options.classList.add('show');
    main.classList.add('active');
    main.setAttribute('aria-expanded', 'true');
    main.innerHTML = '<i class="fas fa-times"></i>';
  }

  main.addEventListener('click', (e) => {
    e.stopPropagation();
    options.classList.contains('show') ? closeFab() : openFab();
  });

  document.addEventListener('click', (e) => {
    if (!main.contains(e.target) && !options.contains(e.target)) {
      if (options.classList.contains('show')) closeFab();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && options.classList.contains('show')) closeFab();
  });
})();

/* ============================================================
   10) BACK TO HOME — FIXED
   ============================================================ */
(function initBackHome() {
  const btn = document.getElementById('backHome');
  if (!btn) {
    console.warn('Back-to-Home button not found');
    return;
  }

  // Toggle visibility based on scroll position
  function toggleVisibility() {
    const scrolled = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
    if (scrolled > 300) {
      btn.classList.add('show');
    } else {
      btn.classList.remove('show');
    }
  }

  // Scroll handler
  window.addEventListener('scroll', toggleVisibility, { passive: true });

  // Click handler — smooth scroll to top
  btn.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();

    // Prefer native smooth scroll
    if ('scrollBehavior' in document.documentElement.style) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Fallback for older browsers
      const start = window.scrollY || document.documentElement.scrollTop;
      const duration = 600;
      const t0 = performance.now();

      function ease(t) { return 1 - Math.pow(1 - t, 3); }

      function step(now) {
        const p = Math.min((now - t0) / duration, 1);
        window.scrollTo(0, start * (1 - ease(p)));
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
  });

  // Also handle keyboard activation (Enter/Space)
  btn.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      btn.click();
    }
  });

  // Initial check on page load
  toggleVisibility();

  // Also re-check after a tick (in case content loads late)
  setTimeout(toggleVisibility, 200);
})();

/* ============================================================
   11) CONSOLE
   ============================================================ */
console.log('%c🏙️ NOVIXA — AI Smart City Intelligence', 'font-size:20px;font-weight:700;color:#4f6bff;');
console.log('%cBuilding Cities That Think.', 'font-size:14px;color:#5a6478;');