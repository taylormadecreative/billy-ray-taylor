(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Fixed chrome height ----------
     The hero photo must start below the black bars or Billy's head, which sits
     4% into the plate, ends up hidden behind them. Measure rather than assume. */
  var utility = document.querySelector(".utility");
  var navEl = document.querySelector(".nav");
  function setChromeHeight() {
    if (!utility || !navEl) return;
    /* pin the nav to the utility bar's REAL rendered height; the 2.4rem CSS
       fallback is a fraction short, which opened a see-through seam */
    document.documentElement.style.setProperty("--utility-h", utility.getBoundingClientRect().height + "px");
    var h = Math.ceil(navEl.getBoundingClientRect().bottom) + 1;
    document.documentElement.style.setProperty("--chrome-h", h + "px");
  }
  setChromeHeight();
  window.addEventListener("resize", setChromeHeight, { passive: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(setChromeHeight);

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

  /* ---------- Scrollspy ---------- */
  var spyLinks = Array.prototype.filter.call(
    document.querySelectorAll('.nav-links a[href^="#"]'),
    function (a) { return !a.classList.contains("btn"); }
  );
  var spyMap = {};
  spyLinks.forEach(function (a) {
    var sec = document.querySelector(a.getAttribute("href"));
    if (sec) spyMap[a.getAttribute("href").slice(1)] = a;
  });
  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        spyLinks.forEach(function (a) { a.classList.remove("active"); });
        var link = spyMap[en.target.id];
        if (link) link.classList.add("active");
      });
    }, { rootMargin: "-35% 0px -55% 0px" });
    Object.keys(spyMap).forEach(function (id) {
      var sec = document.getElementById(id);
      if (sec) spy.observe(sec);
    });
  }

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
  ravesSection.addEventListener("keydown", function (e) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    userControlled = true;
    clearInterval(autoTimer);
    counter.setAttribute("aria-live", "polite");
    goTo(current + (e.key === "ArrowRight" ? 1 : -1));
    e.preventDefault();
  });

  /* touch / drag */
  var viewport = document.querySelector(".raves-viewport");
  var dragX = null, dragT = 0;
  viewport.addEventListener("pointerdown", function (e) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    dragX = e.clientX;
    dragT = Date.now();
    viewport.classList.add("dragging");
    viewport.setPointerCapture(e.pointerId);
  });
  viewport.addEventListener("pointermove", function (e) {
    if (dragX === null) return;
    var dx = e.clientX - dragX;
    track.style.transform = "translateX(calc(-" + current * 100 + "% + " + dx + "px))";
  });
  function endDrag(e) {
    if (dragX === null) return;
    var dx = e.clientX - dragX;
    var vel = Math.abs(dx) / Math.max(Date.now() - dragT, 1);
    viewport.classList.remove("dragging");
    dragX = null;
    if (Math.abs(dx) > 60 || vel > 0.5) {
      userControlled = true;
      clearInterval(autoTimer);
      goTo(current + (dx < 0 ? 1 : -1));
    } else {
      goTo(current);
    }
  }
  viewport.addEventListener("pointerup", endDrag);
  viewport.addEventListener("pointercancel", endDrag);
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

  /* Hero: layered parallax. Depth order back to front: wall, motes, Billy, copy.
     Scroll: far layers linger (positive yPercent), near ones exit faster.
     Pointer: near layers counter the cursor, far layers follow it, so the
     differential reads as depth. Each writes different transform props. */
  gsap.set(".hero-bg", { scale: 1.12 });
  gsap.timeline({ defaults: { ease: "power4.out" } })
    .from(".hero-bg", { scale: 1.2, opacity: 0, duration: 1.4, ease: "power2.out" })
    .from("[data-hero-figure]", { yPercent: 7, opacity: 0, duration: 1.2, ease: "power3.out" }, "-=1.05")
    .from("[data-hero]", { y: 30, opacity: 0, duration: 0.85, stagger: 0.1 }, "-=0.95")
    .from("[data-hero-motes] span", { opacity: 0, duration: 1.2, stagger: 0.06, ease: "power2.out" }, "-=0.8");

  var heroFigure = document.querySelector("[data-hero-figure]");
  var heroMotes = document.querySelector("[data-hero-motes]");

  gsap.matchMedia().add("(min-width: 901px)", function () {
    var scrollScrub = { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.8 };
    gsap.to(".hero-bg", { yPercent: 9, ease: "none", scrollTrigger: scrollScrub });
    gsap.to(heroMotes, { yPercent: 16, opacity: 0.2, ease: "none", scrollTrigger: scrollScrub });
    gsap.to(heroFigure, { yPercent: 4, ease: "none", scrollTrigger: scrollScrub });
    gsap.to(".hero-copy", { yPercent: -10, opacity: 0.25, ease: "none", scrollTrigger: scrollScrub });

    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      var toBgX = gsap.quickTo(".hero-bg", "x", { duration: 1.2, ease: "power3.out" });
      var toBgY = gsap.quickTo(".hero-bg", "y", { duration: 1.2, ease: "power3.out" });
      var toFigX = gsap.quickTo(heroFigure, "x", { duration: 0.9, ease: "power3.out" });
      var toFigY = gsap.quickTo(heroFigure, "y", { duration: 0.9, ease: "power3.out" });
      var toMoteX = gsap.quickTo(heroMotes, "x", { duration: 1.5, ease: "power3.out" });
      window.addEventListener("pointermove", function (e) {
        var nx = e.clientX / window.innerWidth - 0.5;
        var ny = e.clientY / window.innerHeight - 0.5;
        toBgX(nx * 14);
        toBgY(ny * 8);
        toFigX(nx * -28);
        toFigY(ny * -15);
        toMoteX(nx * -46);
      }, { passive: true });
    }
    return function () {};
  });

  /* Stage: Billy walks into the spotlight, then the headline drifts up behind him.
     Uses set + to (never from) so a trigger that fails to fire can never leave
     the stage blank; a watchdog force-plays it if ScrollTrigger never runs. */
  var stageType = document.querySelector("[data-stage-type]");
  var stageBilly = document.querySelector("[data-stage-billy]");
  if (stageType && stageBilly) {
    var lines = gsap.utils.toArray(stageType.querySelectorAll("span"));

    gsap.set(stageBilly, { opacity: 0, yPercent: 9, scale: 0.955, transformOrigin: "50% 100%" });
    gsap.set(lines, { opacity: 0, yPercent: 22 });

    var stageTl = gsap.timeline({
      scrollTrigger: { trigger: ".stage", start: "top 78%", once: true }
    })
      .to(stageBilly, { opacity: 1, yPercent: 0, scale: 1, duration: 1.1, ease: "power3.out" })
      .to(lines, { opacity: 1, yPercent: 0, duration: 0.85, stagger: 0.09, ease: "power3.out" }, "-=0.72");

    /* Watchdog. If the entrance never ran, reveal it with plain DOM writes rather
       than GSAP, so a stalled ticker cannot leave the stage blank. */
    setTimeout(function () {
      if (stageTl.progress() > 0) return;
      if (stageTl.scrollTrigger && stageTl.scrollTrigger.start > window.scrollY + window.innerHeight) return;
      stageTl.kill();
      [stageBilly].concat(lines).forEach(function (el) {
        el.style.opacity = "1";
        el.style.transform = "none";
      });
    }, 4000);

    /* ongoing parallax: the headline rises, Billy holds back, so he keeps masking it */
    gsap.to(stageType, {
      yPercent: -13,
      ease: "none",
      scrollTrigger: { trigger: ".stage", start: "top bottom", end: "bottom top", scrub: 0.6 }
    });
    var billyWrap = stageBilly.parentNode.querySelector(".stage-cut-wrap") || stageBilly;
    if (billyWrap !== stageBilly) {
      gsap.to(billyWrap, {
        yPercent: 3.5,
        ease: "none",
        scrollTrigger: { trigger: ".stage", start: "top bottom", end: "bottom top", scrub: 1.2 }
      });
    }
  }

  /* Win chart: a volatile line fights out of the loss zone, bursts through $0,
     and slams into $1B+ with a flash. Default markup is the COMPLETE chart, so
     reduced-motion and no-JS see the finished graphic; start states are applied
     only when the animation will run, with a DOM-write watchdog as backstop. */
  var dial = document.getElementById("score-dial");
  var winPath = document.getElementById("win-path");
  var winTrail = document.getElementById("win-trail");
  var winDot = document.getElementById("win-dot");
  var winScan = document.getElementById("win-scan");
  var winRing = document.getElementById("win-ring");
  var winZero = document.getElementById("win-zero-line");
  var burstLayer = document.getElementById("win-bursts");
  var clipRect = document.getElementById("draw-clip-rect");
  if (dial && winPath && winDot && clipRect) {
    var pathLen = winPath.getTotalLength();
    [winPath, winTrail].forEach(function (p) {
      p.style.strokeDasharray = pathLen;
      p.style.strokeDashoffset = pathLen;
    });
    clipRect.setAttribute("width", "0");
    winDot.setAttribute("opacity", "0");
    dial.classList.remove("is-positive");
    dial.textContent = "-$38M";

    /* find where the line first breaks above $0 (y=400) */
    var zeroLen = 0;
    for (var l = 0; l <= pathLen; l += 4) {
      if (winPath.getPointAtLength(l).y <= 400) { zeroLen = l; break; }
    }

    var SVGNS = "http://www.w3.org/2000/svg";
    function burst(x, y, colors, count, spread) {
      for (var k = 0; k < count; k++) {
        var node = document.createElementNS(SVGNS, k % 3 ? "rect" : "circle");
        if (k % 3) {
          node.setAttribute("width", 7); node.setAttribute("height", 7);
          node.setAttribute("x", x - 3.5); node.setAttribute("y", y - 3.5);
        } else {
          node.setAttribute("r", 4); node.setAttribute("cx", x); node.setAttribute("cy", y);
        }
        node.setAttribute("fill", colors[k % colors.length]);
        burstLayer.appendChild(node);
        var ang = Math.random() * Math.PI * 2;
        var dist = spread * (0.4 + Math.random() * 0.6);
        gsap.fromTo(node, { opacity: 1, scale: 1, transformOrigin: "center" }, {
          x: Math.cos(ang) * dist,
          y: Math.sin(ang) * dist * 0.8 - spread * 0.25,
          rotation: Math.random() * 260 - 130,
          opacity: 0,
          scale: 0.4,
          duration: 0.9 + Math.random() * 0.6,
          ease: "power2.out",
          onComplete: function () { node.remove(); }
        });
      }
    }

    function fmt(v) {
      if (v < 0) return "-$" + Math.abs(Math.round(v)) + "M";
      if (v < 1000) return "$" + Math.round(v) + "M";
      return "$1B+";
    }

    var state = { p: 0 };
    var zeroFired = false;
    var chartTween = gsap.to(state, {
      p: 1,
      duration: 3.2,
      ease: "power2.inOut",
      scrollTrigger: { trigger: ".win-chart-wrap", start: "top 72%", once: true },
      onUpdate: function () {
        var p = state.p;
        var head = pathLen * p;
        winPath.style.strokeDashoffset = pathLen - head;
        winTrail.style.strokeDashoffset = pathLen - head;
        var pt = winPath.getPointAtLength(head);
        winDot.setAttribute("cx", pt.x);
        winDot.setAttribute("cy", pt.y);
        winDot.setAttribute("opacity", p > 0.02 ? "1" : "0");
        winScan.setAttribute("x1", pt.x);
        winScan.setAttribute("x2", pt.x);
        winScan.setAttribute("opacity", p > 0.02 && p < 0.985 ? "1" : "0");
        clipRect.setAttribute("width", String(pt.x));
        var v = -38 + 1038 * p;
        dial.textContent = fmt(v);
        dial.classList.toggle("is-positive", v >= 0);
        if (!zeroFired && head >= zeroLen && zeroLen > 0) {
          zeroFired = true;
          burst(pt.x, 400, ["#B56CD2", "#8FF0DC"], 10, 70);
          gsap.fromTo(winZero, { attr: { "stroke-width": 3 }, opacity: 1 },
            { attr: { "stroke-width": 1.5 }, opacity: 0.8, duration: 0.9, ease: "power2.out" });
        }
      },
      onComplete: function () {
        burst(1140, 44, ["#8FF0DC", "#B56CD2", "#ECE9E0"], 18, 120);
        gsap.fromTo(winRing, { attr: { r: 12 }, opacity: 0.9 },
          { attr: { r: 110 }, opacity: 0, duration: 0.9, ease: "power2.out" });
        gsap.fromTo(dial, { scale: 1.1 }, { scale: 1, duration: 0.5, ease: "power2.out" });
        gsap.fromTo(".win-chart-wrap", { scale: 1.012, transformOrigin: "50% 60%" },
          { scale: 1, duration: 0.6, ease: "power2.out" });
        gsap.to(winDot, { attr: { r: 12.5 }, duration: 1.1, repeat: -1, yoyo: true, ease: "sine.inOut" });
      }
    });

    /* Watchdog: never let the chart sit invisible if the trigger cannot fire. */
    setInterval(function () {
      if (state.p > 0) return;
      var r = document.querySelector(".win-chart-wrap").getBoundingClientRect();
      if (r.top < window.innerHeight * 0.9 && r.bottom > 0) {
        if (chartTween.progress() > 0) return;
        chartTween.kill();
        winPath.style.strokeDashoffset = "0";
        winTrail.style.strokeDashoffset = "0";
        clipRect.setAttribute("width", "1170");
        winDot.setAttribute("opacity", "1");
        winDot.setAttribute("cx", "1140");
        winDot.setAttribute("cy", "44");
        dial.textContent = "$1B+";
        dial.classList.add("is-positive");
        state.p = 1;
      }
    }, 3000);
  }
})();
