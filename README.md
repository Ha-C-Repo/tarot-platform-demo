# Tarot platform — white-label demo

A clickable demo of a complete readings-and-tools site for tarot readers and astrologers, with **no
client's name on it**. Built to be shown to any reader as "this is what yours would look like".

Live: **https://ha-c-repo.github.io/tarot-platform-demo/** (GitHub Pages, project site, HTTPS enforced).

## Run it

Double-click `index.html`. No server, no build step, no npm, no internet. Classic scripts rather than
ES modules, and no `crossorigin` font preload, precisely so that opening it from a file works. Tested
in Chromium both ways (served and from file). `404.html` is the one exception: it uses absolute paths
so it works at any depth on the published site, and is not meant to be opened from a file.

## The demo's tricks

| Where | What it does |
|---|---|
| **Customise** (bottom right) | Practice name, role, city, reading price, one of four palettes: the whole site rebrands live. |
| **Viewing as** (in Customise) | *Subscriber* (default): no ads, everything unlocked, unlimited readings. *Free visitor*: ad slots, the members' Vault locked, one card reading a day. Flip it in front of a prospect. |
| **Take the tour** (home page, and in Customise) | 12-step guided tour across the pages, ending on Customise. Starts by itself on a first visit (remembered in `localStorage`), with Skip, Back and Escape. |

Everything is stored in that browser only, and cleared by **Reset demo data**.

## What is real

Every calculator does real maths and states its method on the page. Verified against sources outside
this code; the checks are committed in `tests/` (see Tests below).

| Tool | What it computes | Verified against |
|---|---|---|
| Card pull | A persistent 78-card deck. **Shuffle** = uniform Fisher-Yates with `crypto.getRandomValues`, each card independently upright or reversed. The order **stays until the next shuffle**, across reloads. **Pull** deals the top card; **New reading** returns the three to the bottom unshuffled. | 60,000-shuffle chi-square on top and third card, reversal rate; persistence semantics |
| Card meanings | Upright and reversed meaning for all 78 cards, Waite's additional meanings, his table of recurring ranks, and spread-pattern notes (suit, Major Arcana, court cards, reversals). | Transcribed verbatim from A.E. Waite, *The Pictorial Key to the Tarot* (1911), public domain |
| Moon tracker | Phase angle, illumination, moon sign, next new and full, month calendar, drawn moon with maria and craters | Almanac full moon 3 Jan 2026; every 2026 new/full moon vs Astronomy Engine (worst 3 min) |
| Compatibility, full | Both charts from date, time and place: ten bodies, mean node, Ascendant, MC, houses (Whole Sign default, Equal option), 10×10 synastry grid, composite by midpoints, published heuristic score | Astrodienst chart of a Rodden-AA birth: all ten bodies within 13″, ASC and MC within 1″ |
| Compatibility, quick | Two dates only: sun element, Chinese triad, life path, modality. Weighting published. | Heuristic, and labelled as one |
| Birth time → UTC | Browser IANA time-zone data, two-pass inversion. The repeated hour when clocks go back is flagged (first occurrence used); the skipped hour is flagged. "Time unknown" mode drops houses and the Ascendant and flags the Moon if it changes sign that day. | Sydney 1974, New York 1985 (EST and EDT), London 1968 (British Standard Time), Denver 2026, Honolulu 1961, NY 2021 fold and gap |
| Birth places | 34,146 GeoNames cities (population > 15,000 or capitals) with their IANA zone, searchable offline, loaded only on pages that ask for a place. | GeoNames cities15000, CC BY 4.0 |
| Chinese | Animal and element by **both** Lunar New Year and Lichun; Four Pillars from the exact birth moment (hour pillar needs a time). | Every Lunar New Year 1901–2099 and 580 sample births vs lunar-javascript (6tail, MIT) |
| Numerology | Life path, expression, soul urge, personality, birthday, personal year. Pythagorean, reduce-components-first. | 14 Feb 1990 → life path 8 |
| Maya | Tzolk'in, Haab', Long Count on GMT 584283. Not Dreamspell. | 0.0.0.0.0 = 4 Ahau 8 Cumku; 13.0.0.0.0 = 4 Ahau 3 Kankin |

Planet positions come from **Astronomy Engine** by Don Cross (MIT), vendored at
`js/vendor/astronomy.browser.min.js` with its licence. Not Swiss Ephemeris (AGPL).

## What is placeholder, on purpose

- **Interpretations.** The card meanings are Waite's 1911 text plus a line of modern keywords: generic,
  the same for everyone, and credited on the page. Moon, compatibility, numerology, Chinese and Maya
  interpretations are marked **"Placeholder — your writing goes here"**. On a live site the reader's own
  writing replaces all of it: that is what makes it theirs.
- **Video and streams.** Reels row and live-reading panel on the home page, the monthly recorded
  reading in the Vault: designed empty states, labelled. No third-party embed script loads.
- **Payments and bookings.** Every pay or book button opens a "that button is switched off" notice.
  No payment integration, no keys, not even test keys, and no card field anywhere.
- **Contact.** The notice says contact details go here; there is no real address on the site.

## What is deliberately not here

- **No AI at runtime.** Nothing calls a model.
- **No personalisation of the draw.** Nothing the site knows about a visitor changes the odds or the
  wording. The visitor's own shuffles decide the order; every order is equally likely.
- **No data collection.** Nothing leaves the browser: no analytics, no ad network, no forms that submit.
  Adding analytics means loosening the CSP to match and saying so here.
- **No curses, hexes, binding, love spells or destiny swapping** in any copy.

## Hosting notes (GitHub Pages)

| Item | State |
|---|---|
| `.nojekyll` | Present, so Jekyll does not drop files starting with `_`. |
| `_headers` | Cloudflare syntax, **inactive on GitHub Pages** (Pages cannot set headers). Commented as such, kept for a future Cloudflare move. |
| Content-Security-Policy | A `<meta http-equiv>` tag in every page: `default-src 'self'`, `connect-src 'none'`, `form-action 'none'`. |
| Keeping it out of search | `noindex,nofollow` meta on every page. `robots.txt` is kept, but on a project site it is not at the domain root, so crawlers never read it; the meta tag does the work. |
| `og:image` | Absolute URL, plus `og:url` per page. |
| `404.html` | Absolute paths with the `/tarot-platform-demo/` prefix, so it renders at any missing depth. |
| Size | The published site is about 12 MB (Pages artifact 11.6 MB, measured 2026-09-28), well under the 1 GB limit. |

This build takes no money. Production client sites that take bookings or subscriptions belong on a host
that allows commerce (Cloudflare Pages), not here.

## Tests

```
node tests/run.js
```

Plain Node, no dependencies. `tests/chart.test.js` (ephemeris, angles, time zones, houses at -34° and
+70°, time-unknown mode, aspects, midpoints), `tests/calendars.test.js` (numerology, Maya, Chinese New Year,
Four Pillars, moon phases), `tests/deck.test.js` (uniformity, persistence, spread analysis).
Reference data: `tests/fixtures/lunar-javascript-reference.json`.

## Files

```
index.html  pull.html  moon.html  compatibility.html  numerology.html  chinese.html  maya.html
handbook.html  pricing.html  404.html
css/base.css          design system, four palettes, all components
js/site.js            brand config, nav, footer, Customise panel, Free/Subscriber view, demo modal
js/tour.js            the guided tour
js/astro.js           Meeus sun/moon: phases, moon sign, calendar (unchanged from the first demo)
js/chart.js           charts: planets, time zones, angles, houses, aspects, synastry, composite
js/places.js          birth-place search over js/data/cities.js
js/deck.js            the persistent deck, spread analysis, card back
js/cards.js           78 cards, keywords, card faces
js/chinese.js         zodiac by both boundaries, Lunar New Year, Four Pillars
js/numerology.js  js/maya.js  js/moonviz.js
js/data/meanings.js   Waite's meanings, recurrence table, spread notes
js/data/cities.js     generated by tools/build-cities.py from GeoNames
js/vendor/            Astronomy Engine and its licence
tools/build-cities.py regenerates cities.js from a GeoNames download
tests/                the checks above
```

## Card artwork

All 78 cards are the original 1909 Rider-Waite-Smith scans, illustrated by Pamela Colman Smith,
resized to 500px wide. Public domain in the US on age, and in life+70 countries since 1 January 2022
(Smith died 1951). Modern recoloured editions are separate copyrighted works, and "Rider-Waite" is a
trademark of US Games Systems, so it is named factually in the credit and never used as branding.
Any card without a file falls back to a drawn design, so a partial or different deck works.

## Known gaps

1. **Placidus houses** are not offered: they need iterative solving and fail above about 66° latitude.
   A planned addition.
2. **All four palettes are dark.** A light theme is a new set of tokens at the top of `css/base.css`.
3. **Firefox from a file** is untested: served, it behaves like any static site.
