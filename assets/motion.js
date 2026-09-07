import { animate, inView, scroll } from "https://cdn.jsdelivr.net/npm/motion@13.2.0/+esm";

window.__motionReady = true;

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealSpring = { type: 'spring', stiffness: 140, damping: 20, mass: 0.9 };

/* ---------- Directional reveals with real spring physics ---------- */
const OFFSETS = {
  'fade-up':    { y: [28, 0] },
  'fade-left':  { x: [40, 0] },
  'fade-right': { x: [-40, 0] }
};

if (reduced) {
  document.documentElement.classList.remove('js-motion');
} else {
  document.querySelectorAll('[data-motion]').forEach(function (el) {
    const kind = el.getAttribute('data-motion');
    const delay = (parseInt(el.getAttribute('data-motion-delay'), 10) || 0) / 1000;
    const move = OFFSETS[kind] || OFFSETS['fade-up'];

    inView(el, function () {
      animate(el, Object.assign({ opacity: [0, 1] }, move), Object.assign({ delay: delay }, revealSpring));
    }, { amount: 0.2, margin: '0px 0px -80px 0px' });
  });

  /* ---------- Scroll-linked hero depth (parallax + fade out) ---------- */
  const hero = document.getElementById('hero');
  if (hero) {
    scroll(
      animate('.hero-inner', { y: [0, 90], opacity: [1, 0.15] }, { ease: 'linear' }),
      { target: hero, offset: ['start start', 'end start'] }
    );
  }

  /* ---------- Scroll-linked progress bar (Motion drives it precisely) ---------- */
  scroll(animate('#scroll-progress', { scaleX: [0, 1] }, { ease: 'linear' }));
  const bar = document.getElementById('scroll-progress');
  if (bar) { bar.style.width = '100%'; bar.style.transformOrigin = '0% 50%'; }

  /* ---------- Spring hover on gold CTAs (transform-only, no layout cost) ---------- */
  document.querySelectorAll('.btn-gold, .btn-ghost').forEach(function (btn) {
    btn.addEventListener('pointerenter', function () {
      animate(btn, { scale: 1.04 }, { type: 'spring', stiffness: 400, damping: 18 });
    });
    btn.addEventListener('pointerleave', function () {
      animate(btn, { scale: 1 }, { type: 'spring', stiffness: 400, damping: 22 });
    });
  });

  /* ---------- Floating call button: spring press feedback ---------- */
  const call = document.getElementById('callbtn');
  if (call) {
    call.addEventListener('pointerdown', function () {
      animate(call, { scale: 0.88 }, { type: 'spring', stiffness: 600, damping: 20 });
    });
    call.addEventListener('pointerup', function () {
      animate(call, { scale: 1 }, { type: 'spring', stiffness: 500, damping: 14 });
    });
  }
}