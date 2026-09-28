# Tarot platform — white-label demo

A clickable demo of the whole platform, with **no client's name on it**. Built to be shown to any
tarot reader, astrologer or psychic as "this is what yours would look like".

## Run it

Double-click `index.html`. That is the whole install. No server, no build step, no npm, no internet.
It uses classic scripts rather than ES modules precisely so that opening it from a file works.

## The demo's one trick

Bottom right, **Customise**. Type a practice name, what they do, their city and their reading price,
and pick one of four palettes. The entire site rebrands live. Everything is stored in that browser's
localStorage and cleared by the Reset button.

Show it to a reader with **their own name already typed in**. It lands differently.

## What is real

Every calculator does real maths and shows its method on the page.

| Tool | What it computes | Verified against |
|---|---|---|
| Card pull | Uniform Fisher-Yates over 78 cards, `crypto.getRandomValues`, independent 50/50 reversals | 60,000-draw frequency test |
| Moon tracker | Phase angle, illumination, moon sign, next new and full, month calendar | Truncated Meeus series, ~0.3° |
| Chinese astrology | Animal, element, year pillar, **both** the Lunar New Year and Lichun boundaries | CNY 2024 Feb 10, 2025 Jan 29, 2026 Feb 17, 2027 Feb 6 |
| Numerology | Life path, expression, soul urge, personality, birthday, personal year | 14 Feb 1990 → life path 8 |
| Maya | Tzolk'in, Haab', Long Count on GMT 584283 | 0.0.0.0.0 = 4 Ahau 8 Cumku; 13.0.0.0.0 = 4 Ahau 3 Kankin |
| Compatibility | Sun element, Chinese triad, life-path resonance, modality — weighting published on the page | Heuristic, and labelled as one |

Two traps most competing sites get wrong are handled and explained in the interface:

- **The Chinese zodiac year does not start on 1 January.** Try 30 January 1990: Horse by the popular
  reckoning, Snake by Four Pillars. The demo shows both and says why.
- **Dreamspell is not the traditional Maya count.** This is the real Tzolk'in, correlation stated.

## What is placeholder, on purpose

Every interpretation is marked **"Placeholder — your writing goes here"** in an amber block.
The keywords under each card are generic traditional associations written for this demo; they are
nobody's copyrighted interpretation text and they are not the product.

That is the sales argument, not a gap: **the reader's own writing is what makes it theirs.** A demo
full of convincing-sounding interpretations would suggest the words come free. They do not.

## What is deliberately not here

- **No AI anywhere at runtime.** Nothing calls a model. Deterministic code and pre-written text.
- **No personalisation of the card draw.** Nothing the site knows about a visitor changes the odds or
  the wording. No "I'm sensing…".
- **No data collection.** Nothing leaves the browser. No analytics, no ad network, no payment
  integration, not even in test mode. Ad slots render as labelled placeholders.
- **No curses, hexes, binding, love spells or destiny swapping** in any copy. Protection, cleansing,
  luck, blessings, wellbeing.

## Card art

The 78 Rider-Waite-Smith scans are not bundled — see `assets/cards/README.md` for where to get them,
the two copyright traps, and the exact filenames the demo expects. Until they are dropped in, each card
renders as a typographic face, so the demo is complete and presentable as-is.

## Files

```
index.html          reading page (front of house)
pull.html           daily three-card draw
moon.html           phase, sign, month calendar
compatibility.html  two birth dates, scored
numerology.html     name and date
chinese.html        the boundary demo
maya.html           Tzolk'in, Haab', Long Count
handbook.html       library, practice, the content line
pricing.html        four tiers, recorded vs live spelled out
js/astro.js         sun/moon longitudes, phases, solar terms, Chinese new year
js/cards.js         78-card deck, the draw, the card face
js/numerology.js  js/chinese.js  js/maya.js  js/moonviz.js
js/site.js          brand config, nav, footer, the Customise panel
css/base.css        design system and four palettes
```

## Hosting

Ready to host as-is. It is a flat static site with no build step.

**Cloudflare Pages:** create a project, upload this folder (or connect a repo), leave the build
command empty and set the output directory to `/`. `_headers` and `robots.txt` are already here and
Cloudflare picks them up automatically.

What is configured:

- `robots.txt` and a `noindex,nofollow` meta tag on every page, plus `X-Robots-Tag` in `_headers`.
  This is a sales tool with placeholder content: indexed, it would compete with the real client sites
  you build and read as a dead business.
- `_headers` carries a content security policy, `nosniff`, frame and referrer policy, a permissions
  policy, and long cache lifetimes for fonts and card art. The CSP is strict because the site makes no
  outbound requests at all: `connect-src 'none'`, `form-action 'none'`.
- `404.html` — Cloudflare serves it automatically.
- Per-page title, description, Open Graph and Twitter card tags, so a pasted link previews properly.
- An inline SVG favicon, no extra request.
- A 1200x630 `assets/og.png` for link previews.
- **Fonts are subset to the characters this site actually uses**: Anton, Inter and Cormorant Italic
  together are 232 KB, down from 1.7 MB. Re-subset if you add a language or a glyph set — the source
  fonts are Anton, Inter and Cormorant Garamond, all SIL Open Font License.

**It still works by double-clicking `index.html`**, which is why there is no preload tag and no ES
modules. Do not "optimise" either of those back in without re-testing from a file.

## Card artwork

**The real deck is installed.** All 78 cards are the original 1909 Rider-Waite-Smith scans,
illustrated by Pamela Colman Smith, resized to 500px wide for the web (about 10 MB for the set,
down from 64 MB of source scans). Originals are archived alongside in `1920s - 1930s (Pam C)/`.

Copyright position: published 1909, so public domain in the US on age, and public domain in life+70
countries since 1 January 2022 because Smith died in 1951. Two things to keep clear of: modern
recoloured and restored editions are separate copyrighted works, and "Rider-Waite" is used as a
trademark by US Games Systems, so it is named factually in the footer credit and never used as branding.

To swap in a different deck, drop files over the top using the same names (`fetch-cards.sh` prints all
78). Any card without a file falls back to the drawn design automatically, so a partial set works.

## Known gaps

1. **`og:image` is a relative path.** Most crawlers resolve it; Slack and X historically want an absolute
   URL. Once the domain is known, one find-and-replace across the nine pages turns
   `assets/og.png` into `https://yourdomain/assets/og.png`. Until then link previews may show text only
   on some platforms.
2. **No analytics.** Deliberate — nothing here phones home, which is what lets the CSP be as tight as it
   is. To add a privacy-respecting counter you also need to loosen `connect-src` in `_headers` to match.
3. **All four palettes are dark.** A light theme is a new set of tokens at the top of `css/base.css`,
   not a rewrite.

## Next, if a reader says yes

`PLAN.md` and `HANDOFF-DEMO.md` in the parent folder cover the production build: the real ephemeris,
the report engine, the licensing decisions, the data rules, and what the reader has to write.
