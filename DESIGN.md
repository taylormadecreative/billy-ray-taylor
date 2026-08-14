# Design system — Billy Ray Taylor speaker site

## Palette (from Billy's existing LinkedXL brand, committed strategy)
- --ink: #08121E (deep blue-ink, page dark ground; never #000)
- --ink-2: #0F1D2E (raised dark surface)
- --paper: #F4F1E8 (warm cream page ground; never #fff)
- --paper-2: #EAE6DA (recessed cream)
- --coral: #FF7155 (committed accent: hero arch, CTA band, buttons)
- --coral-deep: #E4553A (hover)
- --teal: #48A79B (secondary: links, small marks, the "link" motif)
- --purple: #B876D9 (EXPRESSED podcast section only, from the show's logo)

## Typography
- Display: Tanker (Fontshare), all-caps headlines, tight leading (0.92), clamp() fluid.
- Body/UI: Satoshi (Fontshare) 400/500/700/900.
- Scale ratio >= 1.3 between steps. Body max width 68ch.

## Motion
- GSAP 3 + ScrollTrigger (CDN). Seeded paradigms: Pinning (keynote section), Scale & Fade (video + imagery).
- Custom eases: --ease-out: cubic-bezier(0.23, 1, 0.32, 1); --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1).
- Buttons: scale(0.97) on :active, 160ms. Hover states gated behind (hover: hover).
- Marquee: CSS linear infinite. Everything respects prefers-reduced-motion.
- Transitions on transform/opacity only (horizontal accordion flex is the one deliberate exception).

## Bans (project-specific, on top of impeccable's)
- No em dashes in copy.
- No image pills inside headlines (Nelson standing rule; face cutouts may mask/overlap display type instead).
- No hero scroll cues, no status pills with green dots.
- No repeated uppercase kicker above every section; vary section grammar.
