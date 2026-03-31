document.addEventListener('DOMContentLoaded', () => {
  const revealItems = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
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
});
