(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Nav ---------- */
  var nav = document.querySelector(".nav");
  var ticking = false;
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(function () {
        nav.classList.toggle("scrolled", window.scrollY > 24);
        ticking = false;
      });
      ticking = true;
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var toggle = document.querySelector(".nav-toggle");
  var menu = document.getElementById("nav-menu");
  toggle.addEventListener("click", function () {
    var open = menu.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  menu.addEventListener("click", function (e) {
    if (e.target.closest("a")) {
      menu.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });

  /* ---------- Horizontal accordion (the 3 Deliberates) ---------- */
  var slices = Array.prototype.slice.call(document.querySelectorAll(".acc-slice"));
  function openSlice(target) {
    slices.forEach(function (s) {
      var isTarget = s === target;
      s.classList.toggle("is-open", isTarget);
      s.setAttribute("aria-expanded", String(isTarget));
    });
  }
  slices.forEach(function (s) {
    s.addEventListener("click", function () { openSlice(s); });
    s.addEventListener("focus", function () { openSlice(s); });
  });
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    slices.forEach(function (s) {
      s.addEventListener("mouseenter", function () { openSlice(s); });
    });
  }

  /* ---------- Testimonial carousel ---------- */
  var track = document.querySelector(".raves-track");
  var raveCount = document.querySelectorAll(".rave").length;
  var counter = document.querySelector(".raves-count");
  var current = 0;
  var autoTimer = null;

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function goTo(i) {
    current = (i + raveCount) % raveCount;
    track.style.transform = "translateX(-" + current * 100 + "%)";
    counter.textContent = pad(current + 1) + " / " + pad(raveCount);
  }
  function restartAuto() {
    if (reduced) return;
    clearInterval(autoTimer);
    autoTimer = setInterval(function () { goTo(current + 1); }, 7000);
  }
  var userControlled = false;
  document.querySelectorAll(".raves-arrow").forEach(function (btn) {
    btn.addEventListener("click", function () {
      userControlled = true;
      clearInterval(autoTimer);
      counter.setAttribute("aria-live", "polite");
      goTo(current + parseInt(btn.dataset.dir, 10));
    });
  });
  var ravesSection = document.querySelector(".raves");
  function pauseAuto() { clearInterval(autoTimer); }
  function resumeAuto() { if (!userControlled) restartAuto(); }
  ravesSection.addEventListener("mouseenter", pauseAuto);
  ravesSection.addEventListener("mouseleave", resumeAuto);
  ravesSection.addEventListener("focusin", pauseAuto);
  ravesSection.addEventListener("focusout", resumeAuto);
  restartAuto();

  /* ---------- Video: click to load ---------- */
  var playBtn = document.querySelector(".video-play");
  if (playBtn) {
    playBtn.addEventListener("click", function () {
      var id = playBtn.dataset.video;
      var frame = playBtn.closest(".stage");
      var iframe = document.createElement("iframe");
      iframe.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0";
      iframe.title = "Billy Ray Taylor video";
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.allowFullscreen = true;
      iframe.className = "stage-frame";
      frame.appendChild(iframe);
      playBtn.remove();
    });
  }

  /* ---------- Footer year ---------- */
  document.getElementById("year").textContent = String(new Date().getFullYear());

  /* ---------- GSAP ---------- */
  if (reduced || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);
  document.documentElement.classList.add("gsap-ready");

  /* Hero entrance: staggered copy, arch grows, Billy rises */
  gsap.timeline({ defaults: { ease: "power4.out" } })
    .from(".hero-bg", { scale: 1.08, opacity: 0, duration: 1.4, ease: "power2.out" })
    .from("[data-hero]", { y: 30, opacity: 0, duration: 0.85, stagger: 0.1 }, "-=1.0");

  /* Stage: the headline drifts up behind Billy as you scroll, so he masks it */
  var stageType = document.querySelector("[data-stage-type]");
  if (stageType) {
    gsap.fromTo(stageType,
      { yPercent: 14, scale: 0.94 },
      {
        yPercent: -12,
        scale: 1.06,
        ease: "none",
        scrollTrigger: {
          trigger: ".stage",
          start: "top bottom",
          end: "bottom top",
          scrub: 0.6
        }
      });
    gsap.from(".stage-cut", {
      yPercent: 6,
      ease: "none",
      scrollTrigger: { trigger: ".stage", start: "top bottom", end: "bottom top", scrub: 1.1 }
    });
  }

  /* Reveals */
  gsap.utils.toArray("[data-reveal]").forEach(function (el) {
    gsap.from(el, {
      y: 34,
      opacity: 0,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 88%" }
    });
  });

  /* Scale & Fade: media grows in, dims on the way out */
  gsap.utils.toArray("[data-sf]").forEach(function (el) {
    gsap.timeline({
      scrollTrigger: { trigger: el, start: "top 95%", end: "bottom 5%", scrub: true }
    })
      .fromTo(el, { scale: 0.88, opacity: 0.4 }, { scale: 1, opacity: 1, duration: 0.35, ease: "none" })
      .to(el, { duration: 0.35, ease: "none" })
      .to(el, { scale: 0.97, opacity: 0.35, duration: 0.3, ease: "none" });
  });

  /* Pin the keynote title column while the body scrolls (desktop only) */
  ScrollTrigger.matchMedia({
    "(min-width: 961px)": function () {
      ScrollTrigger.create({
        trigger: ".keynote-grid",
        pin: ".keynote-pin",
        start: "top 120px",
        end: "bottom bottom",
        pinSpacing: false
      });
    }
  });

  /* Scoreboard dial: -$38M rolls up to $1B+ */
  var dial = document.getElementById("score-dial");
  if (dial) {
    dial.classList.remove("is-positive");
    dial.textContent = "-$38M";
    var state = { v: -38 };
    function fmt(v) {
      if (v < 0) return "-$" + Math.abs(Math.round(v)) + "M";
      if (v < 1000) return "$" + Math.round(v) + "M";
      return "$1B+";
    }
    gsap.to(state, {
      v: 1000,
      duration: 2.4,
      ease: "power2.inOut",
      scrollTrigger: { trigger: ".scoreboard", start: "top 75%", once: true },
      onUpdate: function () {
        dial.textContent = fmt(state.v);
        dial.classList.toggle("is-positive", state.v >= 1000);
      }
    });
  }
})();
