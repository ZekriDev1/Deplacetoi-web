/**
 * script.js
 * Minimal, performant JS for:
 * - Navbar scroll behavior
 * - Mobile toggle
 * - Hero mouse-parallax
 * - Phone UI card animation rotation
 * - Feature tilt (lightweight)
 * - Smooth scroll reveal for sections
 */

/* ---------- Helpers ---------- */
const qs = (s, e = document) => e.querySelector(s);
const qsa = (s, e = document) => Array.from((e || document).querySelectorAll(s));
const now = () => performance.now();

/* ---------- DOM references ---------- */
const header = qs('.nav-wrap');
const mobileToggle = qs('#mobileToggle');
const navLinks = qs('#nav-links');
const heroWrap = qs('#heroPhoneWrap');
const phone = qs('#phone');
const phoneCards = qsa('.ui-cards .card');
const featureCards = qsa('[data-feature]');
const timeline = qs('#timeline');
const yearSpan = qs('#year');

/* ---------- Dynamic year ---------- */
if (yearSpan) yearSpan.textContent = new Date().getFullYear();

/* ---------- NAV: add solid on scroll ---------- */
const SCROLL_THRESHOLD = 60;
const onScroll = () => {
  if (window.scrollY > SCROLL_THRESHOLD) header.classList.add('scrolled');
  else header.classList.remove('scrolled');
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---------- MOBILE nav toggle ---------- */
mobileToggle && mobileToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  mobileToggle.classList.toggle('open');
});

/* close mobile nav when link clicked (for small screens) */
qsa('.nav-link').forEach(a => a.addEventListener('click', () => {
  if (navLinks.classList.contains('open')) navLinks.classList.remove('open');
}));

/* ---------- HERO mouse move parallax (low cost) ---------- */
(function heroParallax(){
  const layers = qsa('.layer');
  if (!layers.length) return;
  let width = window.innerWidth, height = window.innerHeight;
  window.addEventListener('resize', ()=>{ width = innerWidth; height = innerHeight; });

  // reduce frequency with requestAnimationFrame pattern
  let lastX = 0, lastY = 0, ticking = false;
  window.addEventListener('mousemove', (e) => {
    lastX = (e.clientX / width) - 0.5;
    lastY = (e.clientY / height) - 0.5;
    if (!ticking) {
      requestAnimationFrame(() => {
        // apply subtle transform to layers (different multipliers)
        layers.forEach((L, i) => {
          const mul = (i+1) * 6; // different depth
          const tx = lastX * mul;
          const ty = lastY * mul;
          L.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
        });
        // phone tilt
        if (phone) {
          const rx = lastY * 6;
          const ry = lastX * -10;
          phone.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();

/* ---------- Phone UI card rotator (CSS free, lightweight) ---------- */
(function cardRotator(){
  if (!phoneCards.length) return;
  let idx = 0;
  setInterval(()=> {
    phoneCards.forEach((c, i) => c.classList.remove('card--active'));
    phoneCards[idx].classList.add('card--active');
    idx = (idx + 1) % phoneCards.length;
  }, 2800);
})();

/* ---------- Feature card tilt: small, performant effect ---------- */
(function tiltCards(){
  const max = 12; // max tilt deg
  featureCards.forEach(el => {
    let rect = null;
    const onMove = (e) => {
      if (!rect) rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      const rx = (y * max) * -1;
      const ry = (x * max);
      el.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0) scale(1.01)`;
      el.style.boxShadow = `0 30px 60px rgba(0,0,0,0.65), 0 0 40px rgba(255,44,168,0.06)`;
    };
    const onLeave = () => {
      rect = null;
      el.style.transform = '';
      el.style.boxShadow = '';
    };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    el.addEventListener('touchstart', onLeave); // turn off on touch
  });
})();

/* ---------- Simple reveal animations for sections when entering viewport ---------- */
(function reveals(){
  const revealEls = qsa('.features, .how, .download, .hero-inner');
  if (!revealEls.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('inview');
        // once revealed, unobserve to improve perf
        obs.unobserve(en.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => obs.observe(el));
})();

/* ---------- Smooth scroll for internal links (native-supported if available) ---------- */
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href').slice(1);
  const el = document.getElementById(id);
  if (el) {
    e.preventDefault();
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}, { passive: false });

/* ---------- Perf note: keep JS small and passive listeners where possible ----------
   - Avoid heavy frame-based calculations
   - Use requestAnimationFrame for mouse parallax
   - IntersectionObserver prevents expensive scroll handlers
   --------------------------------------------------------------------------- */
