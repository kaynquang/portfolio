// Scroll reveal and hero parallax. Does nothing under prefers-reduced-motion.

export function initMotion(root = document) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  root.documentElement.classList.add('js-reveal');

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.classList.add('is-visible');
      io.unobserve(e.target);
    }
  }, { threshold: 0.12 });
  root.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));

  const layers = [...root.querySelectorAll('[data-parallax]')];
  if (!layers.length) return;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      const y = window.scrollY;
      for (const el of layers) el.style.translate = `0 ${(-y * Number(el.dataset.parallax)).toFixed(1)}px`;
      ticking = false;
    });
  }, { passive: true });
}
