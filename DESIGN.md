# Design system — Billy Ray Taylor speaker site

## Palette — LinkedXL brand, exact
Pulled from linkedxl.com's declared global palette (GeneratePress CSS custom properties), not inferred.

| Token | Value | Their name |
|---|---|---|
| --ink | #010F1D | --contrast |
| --paper | #FBFBF9 | --global-color-8 |
| --paper-2 | #ECE9E0 | --base |
| --coral | #FF7155 | --accent |
| --coral-hover | #FF8461 | --global-color-9 |
| --teal | #48A79B | --base-2 |
| --steel | #48749C | --contrast-2 |
| --purple-deep | #752A93 | --contrast-3 |
| --purple | #B56CD2 | BT Expressed logo, exact |

Logo marks for reference: navy #00274A, mint #79CDB5, steel #406688.

Derived shades exist only where a brand color fails WCAG on a light ground. Coral is 2.62:1 on paper and teal is 2.79:1, so neither may be used as text on light:
- --coral-display #BF543F (4.45 on paper) for large display accents on light
- --coral-deep #A54937 (4.79 on cream) for small coral text on light
- --steel-text #41678A (4.90 on cream) for links and labels on light
- --txt-muted #46545F navy-tinted body copy

On dark grounds the brand colors are used raw: coral 7.12, teal 6.69, cream 15.91, purple 5.56.

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
