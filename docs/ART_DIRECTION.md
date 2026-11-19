# Art direction — "Grain to Thread" (revised 19 Nov 2026 evening, owner's direction)

## What the brand study found (unchanged)

- **The name means the work.** ปั้นข้าว: ปั้น is to shape, ข้าว is rice; the 2014 Thai site played on it (วิธีปั้นข้าว). The line: *ปั้นข้าวให้เป็นเส้น* / *Rice, shaped into noodles*.
- **The mark**: a white oval, a blue serif "PK", green rice ears, red arched lettering (the pre-2017 company name). Only an 88 px GIF exists.
- **The product itself**: dried rice strands in ivory, straw and gold; clear film packs.

## The owner's direction (19 Nov 2026), which wins over the brief where they differ

> "make the background more gradient and the colors feel more natural, u do not need to stick to the colors of the logo. Utilize colors that fit with the theme of rice, premium noodles such as white, cream, gold, brown. Make the top bar have expo-glass-effect use the liquid glass repo … Make a loading animation and maybe recolor their logo to make it feel more premium."

| | Decision |
|---|---|
| Palette | White `#fffdf8`, cream `#f8f2e6` / `#f1e7d5` / `#e7d9bf`, natural gold `#c49a4a` (decoration) and `#835d1c` (text accents, 5.3:1), espresso ink `#2a1c10`, roasted-brown action `#5b3a1f` with cream text (9.6:1), dark-roast chapters `#2b1c11` with cream and gold text. No blue or green. |
| Gradients | Daylight on rice paper: the page ground is warm white at the top left fading to cream, with a soft gold glow at the right and bottom; bands run cream to wheat; dark chapters and the footer carry a gold glow over roasted brown; the hero panel has a warm light behind the pack. |
| Format code | Tonal instead of pack stripes: pale gold (vermicelli), wheat (rice stick), cream (Guay Jub), brown (brown rice). Strand widths unchanged. |
| Header | A floating bar of liquid glass: **Glisse** (npm `glisse@0.5.0`, the studio's liquid-glass library) running on Preact's React-compatible core (19 KB gzip, loaded after first paint). Chromium bends the page behind it; Safari, iPhone browsers and LINE get Glisse's frosted glass (the library refracts only in Chromium). A CSS frosted bar shows first, without JavaScript, and under reduced transparency or more contrast (solid cream). `expo-glass-effect` is the Expo package for native iOS apps; on a website Glisse is the equivalent. |
| Mark | Their PK oval redrawn as vector and recoloured: cream oval, double gold ring, natural-gold rice ears, espresso PK in Trirong. The arched old company name is left out (it is now another company's legal name). Preview only until approved (D21). |
| Loader | On the first open in a browser tab: the oval draws itself, rice grains appear one by one, PK and the wordmark rise, seven gold threads fall (grain to thread), then it lifts at ≈ 1.85 s and the hero's grain window opens. A click or key skips it; not on internal page changes, back/forward or reduced motion; never without JavaScript; a CSS failsafe hides it at 3.2 s if scripts fail. |

## Kept from the first direction

Trirong (Cadson Demak) for display in Thai, Latin and Vietnamese; system sans for body; Thai headings break only between phrases; hairlines and quiet space; specimens of the 2014 photographs at native size; motion families M1–M10 plus the loader; the strand plates as honest image fallbacks.

## Brief rules the owner's direction overrides (recorded, one-word ways back)

| Brief rule | Now | Way back |
|---|---|---|
| No gradient unless from a real material/light transition | Gradients of daylight on rice and roast — kept to that rationale | Remove `--ground`, `--band`, `--deep-ground` |
| No glassmorphism | Glass header (Glisse) | Delete `data-glass` slot + the island |
| No metallic gold | Natural, matte gold (no foil, no shine) | Tokens in `:root` |
| Opening ≤ 1.2 s, no artificial delay | Loader ≈ 1.85 s on a tab's first open; text and links are already rendered beneath it | `PANKAO_LOADER=off` |
| Do not redesign the logo | Recoloured vector mark in the preview | `MARK_APPROVED` stays false; production shows the wordmark |

## Logo-removal test

Remove the mark and the site is still this company's: its name made into the headline, its own pack in a rice-grain window, strand-width product code, and colours taken from the rice and roasted noodles themselves.
