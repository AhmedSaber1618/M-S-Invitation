/* ================================================================
   PREMIUM WEDDING INVITATION — SCRIPT
   Every feature below is written as its own independent block.
   You can delete any single section and the rest of the site will
   keep working. Read CONFIG first — almost everything you'll want
   to personalize lives there.
================================================================ */

/* ----------------------------------------------------------------
   CONFIG
   Edit these values to make the site your own. Nothing else in
   this file needs to change for basic personalization.
---------------------------------------------------------------- */
const CONFIG = {
  brideName: "Muhamed",
  groomName: "Sarah",
  weddingDate: "Friday, the 28th of August, 2026",
  weddingTime: "2:30 PM",
  venueName: "The Orchid Hall-White Plaza",
  venueAddress: "Shooting Club, Maadi, Cairo, Egypt",
  googleMapsLink: "https://www.google.com/maps/place/%D9%82%D8%A7%D8%B9%D8%A9+%D8%A7%D9%81%D8%B1%D8%A7%D8%AD+%D8%A7%D9%84%D8%A7%D9%88%D8%B1%D9%83%D9%8A%D8%AF+%D9%86%D8%A7%D8%AF%D9%89+%D8%A7%D9%84%D8%B5%D9%8A%D8%AF+%D8%A7%D9%84%D9%82%D8%B7%D8%A7%D9%85%D9%8A%D8%A9%E2%80%AD/@29.9840263,31.3304782,17z/data=!3m1!4b1!4m6!3m5!1s0x1458390e9194911d:0xb4fefed9b91042fe!8m2!3d29.9840263!4d31.3304782!16s%2Fg%2F11h_wvwmhc!18m1!1e1?entry=ttu&g_ep=EgoyMDI2MDcyNi4wIKXMDSoASAFQAw%3D%3D",

  // Used by the countdown. Must be a format the JS Date constructor
  // can parse, e.g. "YYYY-MM-DDTHH:MM:SS".
  countdownTarget: "2026-08-28T14:30:00",

  // Timing (milliseconds)
  envelopeEntranceDelay: 1000,
  envelopeAnimationDuration: 1000,
  transitionDuration: 1000,
};

/* ----------------------------------------------------------------
   SMALL SHARED HELPER
   Waits for a CSS transition/animation on `el` to finish, or a
   timeout, whichever comes first — keeps the sequence resilient if
   a browser skips firing the event (e.g. element was hidden).
---------------------------------------------------------------- */
function waitForTransition(el, fallbackMs) {
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      el.removeEventListener("transitionend", finish);
      resolve();
    };
    el.addEventListener("transitionend", finish, { once: true });
    setTimeout(finish, fallbackMs);
  });
}

/* ----------------------------------------------------------------
   FEATURE: CONFIG-DRIVEN TEXT
   Fills every element tagged data-config="fieldName" with the
   matching CONFIG value, so placeholders only need to be edited
   in one place.
---------------------------------------------------------------- */
function applyConfigToPage() {
  document.querySelectorAll("[data-config]").forEach((el) => {
    const key = el.getAttribute("data-config");
    if (Object.prototype.hasOwnProperty.call(CONFIG, key)) {
      el.textContent = CONFIG[key];
    }
  });

  // The wax seal's monogram is derived from the couple's initials,
  // so it always matches CONFIG.brideName / CONFIG.groomName.
  const monogram = document.getElementById("seal-monogram");
  if (monogram) {
    const brideInitial = CONFIG.brideName.charAt(0).toUpperCase();
    const groomInitial = CONFIG.groomName.charAt(0).toUpperCase();
    monogram.textContent = `${brideInitial} & ${groomInitial}`;
  }
}

/* ----------------------------------------------------------------
   FEATURE: ENVELOPE OPENING SEQUENCE
   Handles: entrance animation, idle float, seal tap, flap rotation,
   warm glow, and hand-off to the cinematic transition.
---------------------------------------------------------------- */
function initEnvelopeSequence() {
  const scene = document.getElementById("envelope-scene");
  const envelope = document.getElementById("envelope");
  const flap = document.getElementById("envelope-flap");
  const seal = document.getElementById("wax-seal");
  const glow = document.getElementById("envelope-glow");
  const hint = document.getElementById("envelope-hint");

  if (!scene || !envelope || !flap || !seal) return;

  // Step 1: after a short pause, animate the envelope up from the
  // bottom using translateY + opacity (handled by the .is-entered
  // class in CSS).
  setTimeout(() => {
    envelope.classList.add("is-entered");

    // Step 2: once it has arrived, keep it gently floating and
    // reveal the "tap the seal" hint.
    waitForTransition(envelope, CONFIG.envelopeEntranceDelay + 200).then(() => {
      envelope.classList.add("is-floating");
      if (hint) hint.classList.add("is-visible");
    });
  }, CONFIG.envelopeEntranceDelay);

  let hasOpened = false;

  seal.addEventListener("click", () => {
    // Disable additional clicks immediately.
    if (hasOpened) return;
    hasOpened = true;
    seal.disabled = true;
    seal.setAttribute("aria-disabled", "true");
    if (hint) hint.classList.remove("is-visible");

    // Seal: small scale down + fade out.
    seal.classList.add("is-tapped");

    // Flap: rotateX(180deg) from the top edge.
    flap.classList.add("is-open");

    waitForTransition(flap, CONFIG.envelopeAnimationDuration + 100).then(() => {
      // Warm glow blooms from inside the open envelope.
      if (glow) glow.classList.add("is-active");

      setTimeout(() => {
        // Whole envelope scene fades out, revealing the wedding card.
        scene.classList.add("is-fading-out");

        waitForTransition(scene, CONFIG.envelopeAnimationDuration + 200).then(() => {
          scene.hidden = true;
          runTransitionToCard();
        });
      }, 500);
    });
  });
}

/* ----------------------------------------------------------------
   FEATURE: CINEMATIC TRANSITION + MUSIC START + CARD REVEAL
---------------------------------------------------------------- */
function runTransitionToCard() {
  const overlay = document.getElementById("transition-overlay");
  const mainContent = document.getElementById("main-content");

  if (overlay) overlay.classList.add("is-visible");

  // Background music starts during the transition.
  startBackgroundMusic();

  setTimeout(() => {
    // Reveal the wedding card underneath the overlay.
    if (mainContent) mainContent.classList.add("is-visible");

    setTimeout(() => {
      if (overlay) overlay.classList.remove("is-visible");
    }, 150);
  }, CONFIG.transitionDuration);
}

/* ----------------------------------------------------------------
   FEATURE: BACKGROUND MUSIC + FLOATING TOGGLE
   Independent of the opening sequence — the toggle button and
   audio element work on their own once music has started.
---------------------------------------------------------------- */
function startBackgroundMusic() {
  const music = document.getElementById("bg-music");
  const toggle = document.getElementById("music-toggle");

  if (!music) return;

  music.volume = 0.6;
  music.play().catch(() => {
    /* If autoplay with sound is blocked, the visitor can still
       start it manually via the toggle button. */
  });

  if (toggle) {
    toggle.hidden = false;
    requestAnimationFrame(() => toggle.classList.add("is-visible"));
  }
}

function initMusicToggle() {
  const music = document.getElementById("bg-music");
  const toggle = document.getElementById("music-toggle");
  if (!music || !toggle) return;

  toggle.addEventListener("click", () => {
    music.muted = !music.muted;
    toggle.classList.toggle("is-muted", music.muted);
    toggle.setAttribute("aria-pressed", String(music.muted));
  });
}

/* ----------------------------------------------------------------
   FEATURE: SCROLL REVEAL ANIMATIONS
   Uses Intersection Observer. Each .reveal element animates once,
   then stops being observed.
---------------------------------------------------------------- */
function initScrollReveal() {
  const revealEls = document.querySelectorAll(".reveal");
  if (!revealEls.length) return;

  if (!("IntersectionObserver" in window)) {
    // Fallback: just show everything if the browser can't observe.
    revealEls.forEach((el) => el.classList.add("in-view"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2, rootMargin: "0px 0px -10% 0px" }
  );

  revealEls.forEach((el) => observer.observe(el));
}

/* ----------------------------------------------------------------
   FEATURE: COUNTDOWN
   Updates every second. Shows an elegant message once the target
   date has passed.
---------------------------------------------------------------- */
function initCountdown() {
  const daysEl = document.getElementById("countdown-days");
  const hoursEl = document.getElementById("countdown-hours");
  const minutesEl = document.getElementById("countdown-minutes");
  const secondsEl = document.getElementById("countdown-seconds");
  const grid = document.getElementById("countdown-grid");
  const completeMessage = document.getElementById("countdown-complete");

  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  const target = new Date(CONFIG.countdownTarget).getTime();

  function pad(num) {
    return String(num).padStart(2, "0");
  }

  function tick() {
    const now = Date.now();
    const diff = target - now;

    if (diff <= 0) {
      clearInterval(intervalId);
      if (grid) grid.hidden = true;
      if (completeMessage) completeMessage.hidden = false;
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    daysEl.textContent = pad(days);
    hoursEl.textContent = pad(hours);
    minutesEl.textContent = pad(minutes);
    secondsEl.textContent = pad(seconds);
  }

  tick();
  const intervalId = setInterval(tick, 1000);
}

/* ----------------------------------------------------------------
   FEATURE: LOCATION / GOOGLE MAPS BUTTON
   Wires the CONFIG map link into the button's href.
---------------------------------------------------------------- */
function initLocationLink() {
  const mapsButton = document.getElementById("maps-button");
  if (mapsButton) {
    mapsButton.href = CONFIG.googleMapsLink;
  }
}

/* ----------------------------------------------------------------
   INITIALIZE EVERYTHING ONCE THE DOM IS READY
---------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  applyConfigToPage();
  initEnvelopeSequence();
  initMusicToggle();
  initScrollReveal();
  initCountdown();
  initLocationLink();
});
