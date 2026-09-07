document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Lenis smooth scroll (init FIRST) ---------- */
  var lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({ lerp: 0.08 });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
  }

  /* ---------- Scroll reveals are handled by Motion (module script below) ---------- */

  /* ---------- Anchor links via Lenis ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var t = document.querySelector(a.getAttribute('href'));
      if (!t) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(t, { offset: -64 });
      else t.scrollIntoView({ behavior: 'smooth' });
      document.getElementById('mobile-menu').classList.remove('open');
      document.getElementById('burger').classList.remove('open');
    });
  });

  /* ---------- Nav scroll state (progress bar is driven by Motion below) ---------- */
  var nav = document.getElementById('nav');
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    nav.classList.toggle('scrolled', y > 80);
  }
  window.addEventListener('scroll', onScroll);
  onScroll();

  /* ---------- Mobile menu ---------- */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('mobile-menu');
  burger.addEventListener('click', function () {
    burger.classList.toggle('open');
    menu.classList.toggle('open');
  });

  /* ---------- Hero: Splitting FIRST, then GSAP (home page only) ---------- */
  if (window.Splitting) Splitting();
  if (window.gsap && document.getElementById('hero')) {
    var words = document.querySelectorAll('.hero-headline .word');
    if (words.length) {
      gsap.from(words, { y: 40, opacity: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out' });
    }
    gsap.from('.hero-left .label', { y: 16, opacity: 0, duration: 0.6, ease: 'power2.out' });
    gsap.from('.hero-sub', { y: 24, opacity: 0, duration: 0.7, delay: 0.9, ease: 'power3.out' });
    gsap.from('.hero-btns', { y: 20, opacity: 0, duration: 0.6, delay: 1.05, ease: 'power3.out' });
    gsap.from('.hero-img', { x: 60, opacity: 0, duration: 0.9, delay: 0.4, ease: 'power3.out' });
    gsap.from('.hero-badge', { y: 18, opacity: 0, duration: 0.6, delay: 0.5, ease: 'power2.out' });
  }

  /* ---------- tsParticles ---------- */
  if (window.tsParticles) {
    tsParticles.load('particles', {
      particles: {
        number: { value: 28 },
        color: { value: '#ffffff' },
        opacity: { value: 0.18, random: true, animation: { enable: true, speed: 0.6, minimumValue: 0.05, sync: false } },
        size: { value: 2, random: true },
        move: { enable: true, speed: 0.5, direction: 'top', random: true, straight: false, outModes: 'out' },
        shape: { type: 'circle' }
      },
      detectRetina: true
    });
  }

  /* ---------- Trust bar counters: IO + GSAP expo.out ---------- */
  var trust = document.getElementById('trust');
  var counted = false;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting || counted) return;
      counted = true;
      document.querySelectorAll('#trust .counter').forEach(function (el) {
        var target = parseInt(el.getAttribute('data-target'), 10);
        var obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 2,
          ease: 'expo.out',
          snap: { val: 1 },
          onUpdate: function () { el.textContent = Math.round(obj.val).toLocaleString('en-IN'); }
        });
      });
      io.disconnect();
    });
  }, { threshold: 0.35 });
  if (trust) io.observe(trust);

  /* ---------- Vanilla Tilt ---------- */
  if (window.VanillaTilt) {
    VanillaTilt.init(document.querySelectorAll('.service-card'), {
      max: 6, speed: 400, glare: true, 'max-glare': 0.15, perspective: 800
    });
  }

  /* ---------- Testimonials Swiper ---------- */
  if (window.Swiper) {
    new Swiper('.testimonials-swiper', {
      loop: true,
      spaceBetween: 24,
      grabCursor: true,
      centeredSlides: true,
      autoplay: { delay: 3500, disableOnInteraction: false, pauseOnMouseEnter: true },
      breakpoints: {
        0:    { slidesPerView: 1.15, centeredSlides: true },
        768:  { slidesPerView: 2.2,  centeredSlides: false },
        1024: { slidesPerView: 3,    centeredSlides: false }
      }
    });
  }

  /* ---------- Build video: click to play, pause when offscreen ---------- */
  var vid = document.getElementById('build-video');
  var playBtn = document.getElementById('video-play');
  if (vid && playBtn) {
    playBtn.addEventListener('click', function () {
      if (vid.paused) {
        vid.play();
        playBtn.classList.add('playing');
        playBtn.innerHTML = '<i class="fa-solid fa-pause" aria-hidden="true"></i>';
        playBtn.setAttribute('aria-label', 'Pause construction site video');
      } else {
        vid.pause();
        playBtn.classList.remove('playing');
        playBtn.innerHTML = '<i class="fa-solid fa-play" aria-hidden="true"></i>';
        playBtn.setAttribute('aria-label', 'Play construction site video');
      }
    });
    /* Don't burn bandwidth or CPU on a video nobody is looking at. */
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (!e.isIntersecting && !vid.paused) vid.pause(); });
    }, { threshold: 0.15 }).observe(vid);
  }

  /* ---------- Project filter (projects page) ---------- */
  var filterBar = document.querySelector('.proj-filter');
  if (filterBar) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('.proj[data-cat]'));
    var countEl = document.getElementById('proj-count');
    filterBar.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-filter]');
      if (!btn) return;
      var want = btn.getAttribute('data-filter');
      filterBar.querySelectorAll('button').forEach(function (b) {
        b.setAttribute('aria-pressed', String(b === btn));
      });
      var shown = 0;
      cards.forEach(function (c) {
        var match = want === 'all' || c.getAttribute('data-cat') === want;
        c.hidden = !match;
        /* The featured card spans 2 columns; collapse that while filtering so
           the remaining cards don't leave a hole in the grid. */
        c.classList.toggle('proj-lg', match && want === 'all' && c.dataset.featured === '1');
        if (match) shown++;
      });
      countEl.textContent = want === 'all'
        ? 'Showing all ' + shown + ' projects'
        : 'Showing ' + shown + (shown === 1 ? ' project' : ' projects');
    });
    /* Remember which card was the featured one before any filtering happens. */
    var feat = document.querySelector('.proj.proj-lg');
    if (feat) feat.dataset.featured = '1';
  }

  /* ---------- Quote form -> lead pipeline ---------- */
  var form = document.getElementById('quote-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = {
        source: 'contact-form',
        page: location.pathname.split('/').pop() || 'index.html',
        name: form.fname.value.trim(),
        phone: form.phone.value.trim(),
        service: form.service.value,
        message: form.msg.value.trim()
      };
      window.BhishmaLead.send(data);
      form.innerHTML = '<div class="success-msg" style="text-align:center;padding:40px 0;">' +
        '<p style="font-size:24px;font-weight:700;color:#C9A84C;">Got it. We\'ll be in touch within 2 hours.</p>' +
        '<p style="font-size:16px;color:#666;margin-top:8px;">Check your phone — we usually call first.</p>' +
        '<p style="font-size:15px;margin-top:18px;"><a style="color:#C9A84C;font-weight:600;" target="_blank" rel="noopener" href="' +
        window.BhishmaLead.whatsappLink(data) + '">Or message us on WhatsApp now &rarr;</a></p></div>';
    });
  }

});

/*
 * Lead pipeline. Both the contact form and the chat widget funnel through here
 * so there is exactly one place to point at a backend.
 *
 * ENDPOINT is the serverless function that emails the office and pushes a
 * WhatsApp notification (see api/lead.js). If it is unset or unreachable, the
 * lead is kept in localStorage and the caller falls back to the WhatsApp
 * deep link, so an enquiry is never silently lost.
 */
window.BhishmaLead = (function () {
  var ENDPOINT = '/api/lead';
  var WA = '919849512345';

  function whatsappLink(d) {
    var bits = [d.service, d.size, d.budget, d.locality].filter(Boolean).join(' · ');
    var text = 'Hi Bhishma Constructions, I enquired on your website.' +
      (bits ? ' ' + bits + '.' : '') +
      (d.name ? ' My name is ' + d.name + '.' : '');
    return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(text);
  }

  function stash(d) {
    try {
      var all = JSON.parse(localStorage.getItem('bhishma_leads') || '[]');
      all.push(d);
      localStorage.setItem('bhishma_leads', JSON.stringify(all.slice(-25)));
    } catch (e) { /* private mode — nothing we can do, the UI still offers WhatsApp */ }
  }

  function send(d) {
    d.at = new Date().toISOString();
    stash(d);
    if (!ENDPOINT) return false;
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(d)
    }).catch(function () { /* stashed above; WhatsApp fallback is already shown */ });
    return true;
  }

  return { send: send, whatsappLink: whatsappLink };
})();