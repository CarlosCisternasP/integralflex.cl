document.addEventListener('DOMContentLoaded', () => {
  const revealItems = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => observer.observe(item));

  const toggle = document.querySelector('.mobile-toggle');
  const nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const current = getComputedStyle(nav).display;
      nav.style.display = current === 'none' ? 'flex' : 'none';
      nav.style.flexDirection = 'column';
      nav.style.position = 'absolute';
      nav.style.top = '96px';
      nav.style.left = '4%';
      nav.style.right = '4%';
      nav.style.padding = '18px';
      nav.style.background = '#ffffff';
      nav.style.border = '1px solid rgba(16,33,62,.08)';
      nav.style.borderRadius = '18px';
      nav.style.boxShadow = '0 14px 30px rgba(0,0,0,.08)';
    });
  }

  const form = document.getElementById('contactForm');
  if (form) {
    const status = document.getElementById('formStatus');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('.form-submit');
      const data = Object.fromEntries(new FormData(form).entries());
      btn.disabled = true;
      status.textContent = 'Enviando...';
      status.className = 'form-status';
      try {
        const res = await fetch('/.netlify/functions/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const out = await res.json().catch(() => ({}));
        if (res.ok) {
          status.textContent = '✓ Mensaje enviado. Te contactaremos pronto.';
          status.classList.add('ok');
          form.reset();
        } else {
          status.textContent = out.error || 'No se pudo enviar. Intenta nuevamente o escríbenos a contacto@integralflex.cl';
          status.classList.add('err');
        }
      } catch {
        status.textContent = 'Error de conexión. Escríbenos a contacto@integralflex.cl';
        status.classList.add('err');
      }
      btn.disabled = false;
    });
  }

  const quote = document.getElementById('cotizar');
  if (quote) {
    const TIERS = [
      { name: 'Básico', min: 3, max: 5, price: 15.9 },
      { name: 'Profesional', min: 6, max: 15, price: 12.9 },
      { name: 'Enterprise', min: 16, max: 50, price: 9.9 },
      { name: 'Premium', min: 51, max: Infinity, price: 6.9 }
    ];
    const usersEl = document.getElementById('qUsers');
    const fmt = n => 'USD ' + n.toLocaleString('es-CL', { minimumFractionDigits: n % 1 ? 1 : 0, maximumFractionDigits: 2 });
    const state = {};
    function calc() {
      let u = parseInt(usersEl.value, 10);
      if (!Number.isFinite(u) || u < 3) u = 3;
      const tier = TIERS.find(x => u >= x.min && u <= x.max);
      const apps = [...quote.querySelectorAll('input[name=qapp]:checked')].map(i => i.value);
      const per = Math.round(u * tier.price * 100) / 100;
      const total = Math.round(per * apps.length * 100) / 100;
      document.getElementById('qPlan').textContent = tier.name;
      document.getElementById('qUnit').textContent = fmt(tier.price);
      document.getElementById('qLines').innerHTML = apps.length
        ? apps.map(a => `<div><span>${a} · ${u} usuarios</span><span>${fmt(per)}</span></div>`).join('')
        : '<div class="quote-empty">Selecciona al menos una aplicación.</div>';
      document.getElementById('qTotal').textContent = fmt(total);
      document.getElementById('qAnnual').textContent = apps.length ? `${fmt(Math.round(total * 12 * 100) / 100)} al año` : '';
      document.querySelectorAll('.pricing-4 .price-card').forEach(c => {
        c.classList.toggle('is-current', c.querySelector('.price-tag').textContent === tier.name);
      });
      Object.assign(state, { u, tier, apps, total });
    }
    quote.addEventListener('change', calc);
    usersEl.addEventListener('input', calc);
    usersEl.addEventListener('blur', () => { if (!(parseInt(usersEl.value, 10) >= 3)) usersEl.value = 3; calc(); });
    quote.querySelectorAll('.q-step').forEach(b => b.addEventListener('click', () => {
      usersEl.value = Math.max(3, (parseInt(usersEl.value, 10) || 3) + Number(b.dataset.step));
      calc();
    }));
    document.getElementById('qSend').addEventListener('click', () => {
      const f = document.getElementById('contactForm');
      if (!f) return;
      if (!state.apps.length) { quote.querySelector('.q-app span').focus?.(); return; }
      const sel = f.querySelector('select[name=producto]');
      if (sel) sel.value = state.apps.length === 1 ? state.apps[0] : 'Suite completa';
      f.querySelector('textarea[name=mensaje]').value =
        `Solicito cotización:\n- Aplicaciones: ${state.apps.join(', ')}\n- Usuarios: ${state.u}\n- Plan ${state.tier.name}: ${fmt(state.tier.price)} por usuario al mes por aplicación\n- Total estimado: ${fmt(state.total)} al mes + IVA`;
      f.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => f.querySelector('input[name=nombre]').focus({ preventScroll: true }), 500);
    });
    calc();
  }

  const canvas = document.getElementById('networkCanvas');
  if (!canvas || getComputedStyle(canvas).display === 'none') return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const count = Math.min(65, Math.floor(window.innerWidth / 24));
    particles = Array.from({length: count}, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4
    }));
  }
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(130,180,255,0.6)'; ctx.fill();
    }
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 140) {
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(90,150,255,${0.14 - d / 1400})`; ctx.lineWidth = 1; ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize', resize);
  resize(); draw();
});