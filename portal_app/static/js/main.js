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

  const canvas = document.getElementById('networkCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const count = Math.min(65, Math.floor(window.innerWidth / 24));
    particles = Array.from({length: count}, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4
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