---
name: "Ли 力 Wok & Tea"
description: "Red seal, charcoal menu boards and warm tea photography."
colors:
  ink: "#080808"
  panel: "#171615"
  red: "#ef3c2e"
  red-deep: "#c9291f"
  paper: "#f0e8d7"
  white: "#fffaf0"
  muted: "#b5afa5"
  line: "#38342e"
  control-border: "#726b61"
  red-hover: "#ff594b"
typography:
  display:
    fontFamily: "Oswald, sans-serif"
    fontSize: "clamp(3rem, 4.8vw, 4.35rem)"
    fontWeight: 600
    lineHeight: 1.16
    letterSpacing: "-.025em"
  headline:
    fontFamily: "Oswald, sans-serif"
    fontSize: "clamp(2.7rem, 4vw, 4.5rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-.025em"
  title:
    fontFamily: "Golos Text, sans-serif"
    fontSize: "17px"
    fontWeight: 500
    lineHeight: 1.5
  body:
    fontFamily: "Golos Text, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "Golos Text, sans-serif"
    fontSize: "12px"
    fontWeight: 400
rounded:
  field: "3px"
  control: "4px"
  circle: "50%"
spacing:
  compact: "8px"
  small: "12px"
  medium: "16px"
  large: "24px"
  wide: "28px"
components:
  button-primary:
    backgroundColor: "{colors.red}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "16px 24px"
    height: "54px"
  button-primary-hover:
    backgroundColor: "{colors.red-hover}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: "16px 24px"
  button-light:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "16px 24px"
  button-dark:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
    padding: "16px 24px"
  field:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
    rounded: "{rounded.field}"
    padding: "12px 14px"
  category-selected:
    backgroundColor: "{colors.red}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "12px 18px"
---

# Design System: Ли 力 Wok & Tea

## Overview

**Creative North Star: "The Red Seal Café"**

Li's confirmed black and red identity becomes charcoal menu boards, condensed Cyrillic headlines and the 力 seal. Original food, entrance and tea photographs carry the atmosphere; the faint decorative dragon remains a background accent. The warm paper tea surface gives the same identity a quieter register.

This records the shipped static implementation, not a new direction. Evidence: `site/styles.css`, `site/index.html`, `site/app.js`, `site/assets/oswald.css`, `site/assets/golos.css`; brand commitments in `PRODUCT.md`, provenance in `CONTENT_SOURCES.md`.

**Key Characteristics:**
- Red seal identity and charcoal surfaces.
- Condensed headings, readable Cyrillic body text.
- Original photography with tilted stamps and captions.
- Flat menu rows and keyboard-visible controls.

## Colors

### Primary
Red marks primary actions, selected categories, ratings and identity ribbons. Deep red supports broad colored surfaces and seals; the brighter hover tone signals interaction.

### Neutral
Ink is the page and field background; panel separates the menu and dialogs. Warm white carries primary text, muted carries secondary information, and line divides rows. Paper provides the tea surface, light buttons and toast; ink supplies their text. Control-border outlines interactive fields and secondary buttons.

**The Surface Contrast Rule.** Warm paper surfaces use ink text; charcoal surfaces use warm white text with muted supporting copy.

## Typography

**Display Font:** self-hosted Oswald, sans-serif fallback. **Body Font:** self-hosted Golos Text, sans-serif fallback. Fonts use `font-display: swap`.

Oswald supplies condensed uppercase headlines, prices and prominent numbers; Golos supplies navigation, dish names, descriptions and forms. The frontmatter records the hero, base section heading, menu title and common body roles. Section headings have contextual size overrides; body copy varies between (13–15px). Supporting metadata uses (10–12px), rather than a single proportional type scale. Menu descriptions are capped at (34ch); longer supporting paragraphs commonly use (44–48ch).

**The Two Voices Rule.** Use Oswald for headline and numeric emphasis, Golos for reading and operating the interface.

## Layout

Broad editorial sections alternate with dense menu rows. Main section padding is (94px) vertically and `max(32px, calc((100vw - 1280px) / 2))` horizontally. Header alignment uses a (1360px) measure; hero and place cap at (1440px). Desktop menu uses two columns with a (36px) gap; dish rows reserve a fixed action column.

At (1150px) the header phone hides and compositions tighten. At (800px), padding becomes (64px 24px), the header becomes (76px), hero/place/contacts stack, navigation switches to a toggle and categories scroll horizontally. At (560px), menu, tea, takeaway and reviews stack; the nonempty cart gets a fixed bottom action and footer clearance. At (1600px) the hero removes outer padding. These are content breakpoints, not a generalized device scale.

Sticky-header anchor clearance is (112px), changing to (92px) at the tablet breakpoint. Menu, place and tea compensate this clearance with a negative scroll margin, placing their section edge (8px) under the fixed header so previous-section strips remain hidden. Contacts retain their original anchor behavior. Keep actions and photo captions spatially separate when reducing widths.

## Elevation & Depth

Surfaces are predominantly flat, separated by tone and thin borders. Original photographs, red rings, seals and slightly rotated stamps supply depth. Photo captions use translucent ink backing for legibility. The only box shadow is the floating mobile cart (`0 8px 24px #0006`); it signals its fixed position. Modal backdrops dim the page (`#000b`).

**The Flat Menu Rule.** Menu entries remain border-separated rows rather than raised tiles.

## Shapes

Controls use modest corners: fields and category buttons use the field radius, buttons and dialogs use the control radius. Circular add controls, count badges and the hero ring are native identity/control shapes. Photographic frames and stamps remain rectangular; restrained rotations belong to imagery and seal composition.

## Components

### Buttons
Primary red, outline, paper and ink variants share a minimum height (54px), semibold Golos and the same padding. Outline hover reverses to warm white with ink text; paper hover becomes white; ink hover becomes warm charcoal. Icon-only buttons are (44px) square. Global keyboard focus is a red outline (3px), offset (5px); disabled buttons fade to (.5) opacity.

### Categories and menu rows
Category controls expose `aria-pressed`; selected state fills red with ink text. Menu rows pair dish details with an Oswald price and circular add control. Quantity controls replace add controls, use tabular counts, and preserve logical keyboard focus after rerendering. Tea variety chips are passive bordered labels, not filters.

### Fields
Labeled fields use ink fill, warm white text, control-border strokes and minimum height (48px). Search is an underline variant with a clear control. Native HTML input constraints provide validation; no custom error palette is established.

### Navigation
The solid sticky header uses thin bottom separation. Desktop links turn red on hover. Mobile navigation is a panel beneath the header, with `aria-expanded`, link-close behavior and Escape dismissal. The skip link becomes visible on focus.

### Dialogs and feedback
Native modal dialogs preserve browser focus containment. The cart is a right drawer (510px), capped at viewport width with a scrollable content area; booking is a centered (510px) dialog capped to viewport bounds. Close and backdrop dismissal restore focus to the trigger. Page scrolling locks while a dialog is open. Live status text and a paper toast announce changes; handoff stays explicit about the administrator confirming an order or table.

Motion is brief: color transitions (200–220ms), arrow movement (300ms), drawer entrance (350ms), booking entrance (250ms), photo/seal entrance (800/1000ms). The shared entrance ease is `cubic-bezier(.16, 1, .3, 1)`. Reduced-motion preference removes animations/transitions and smooth scrolling.

## Do's and Don'ts

### Do:
- **Do** preserve the 力 identity and verified organization photography.
- **Do** keep menu rows flat and selected controls explicit.
- **Do** preserve visible keyboard focus, labeled controls and reduced-motion behavior.
- **Do** keep factual qualifications readable near the related action.

### Don't:
- **Don't** replace the confirmed black/red identity with a new palette.
- **Don't** imply an order or table is confirmed before administrator confirmation.
- **Don't** let decorative seals, captions or fixed controls obscure actions.

Not canonized: unused `--panel-raised`, one-off decorative dimensions and the smallest metadata sizes are not reusable system tokens; their presence alone does not establish a durable rule. No craft-floor refusal is promoted to house style.
