# Design system — Billy Ray Taylor speaker site

## Palette — LinkedXL blues and purples, exact
Pulled from linkedxl.com's declared global palette and the Billy Taylor page's own layout CSS. That page leads with purple, over navy grounds, so this site does too. Coral (their --accent) is deliberately not used here.

| Token | Value | Source |
|---|---|---|
| --ink | #010F1D | --contrast |
| --ink-deep | #071428 | their hero gradient navy |
| --indigo | #242454 | sampled from their LED hero wall |
| --paper | #FBFBF9 | --global-color-8 |
| --paper-2 | #ECE9E0 | --base |
| --purple | #B56CD2 | Billy page accent + BT Expressed mark |
| --purple-deep | #752A93 | --contrast-3 |
| --steel | #48749C | --contrast-2 |
| --teal | #48A79B | --base-2 |

Logo marks for reference: navy #00274A, mint #79CDB5, steel #406688.

Roles: purple is the identity accent, blue/steel carries links and structure, teal marks the win (the scoreboard figure, the outcome list). Purple runs raw on dark grounds; on light grounds it drops to --purple-deep, because #B56CD2 measures only 3.36:1 on paper. Steel likewise drops to --steel-text #41678A on light and is large-text-only on dark (3.91:1).

Derived: --purple-hover #C285DC, --steel-text #41678A, --txt-muted #46545F.

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
