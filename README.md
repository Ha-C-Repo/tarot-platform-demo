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
| **Viewing as** (in Customise) | *Subscriber* (default): no ads, everything unlocked, unlimited readings. *Free visitor*: ad slots and the members' Vault locked. Card readings are unlimited in both views, so a prospect can try every spread. Flip it in front of a prospect. |
| **Take the tour** (home page, and in Customise) | 21-step guided tour across the pages (booking, the journal, learning the cards, horoscopes by sign, good days, the I Ching and runes, and the account page included), ending on Customise. A step whose target is hidden (the install panel once installed) is skipped in the direction of travel. Starts by itself on a first visit (remembered in `localStorage`), with Skip, Back and Escape. |

Everything is stored in that browser only, and cleared by **Reset demo data**.

## What is real

Every calculator does real maths and states its method on the page. Verified against sources outside
this code; the checks are committed in `tests/` (see Tests below).

| Tool | What it computes | Verified against |
|---|---|---|
| Card pull | A persistent 78-card deck. **Shuffle** = uniform Fisher-Yates with `crypto.getRandomValues`, each card independently upright or reversed. The order **stays until the next shuffle**, across reloads. **Pull** deals the top card into the next position. Shuffling mid-reading mixes only the cards still in the deck; pulled cards keep their place in the spread. **New reading** returns them to the bottom unshuffled. | 60,000-shuffle chi-square on top and third card, reversal rate; persistence semantics, including a shuffle mid-reading |
| Spreads | Eight: past-present-future, one card, yes or no, situation-obstacle-advice, love (5), full moon (4, shows the next full moon), zodiac houses (12, laid round the wheel like a birth chart), Celtic Cross (10). Choosing another spread mid-reading starts a new reading: the pulled cards go back under the deck unshuffled, exactly as **New reading** does. `pull.html?spread=fullmoon` deep-links; the moon page does. | Every spread deals from the same deck; positions match card counts |
| Celtic Cross | Waite's own method: position names, position texts and the Significator rule verbatim from *Pictorial Key* Part III §7. The Significator (any court card or Major Arcana card) is taken out of the deck, the rest keep their order, and it stays out between readings until another is chosen. | Transcribed from archive.sacred-texts.com; Significator removal and return tested |
| Yes or no | One card: upright answers yes, reversed answers no, stated on the page as the method. The reader's own per-card answers are a placeholder. | Rule tested |
| Tarot birth cards | Mary K. Greer's method (*Tarot for Your Self*, 1984): month + day + year, add the digits, again while above 22 = Personality card; its digits = Soul card. 22 = The Fool with The Emperor; 19 = The Sun, Wheel of Fortune, The Magician. On the numerology page with the working shown. | Published worked examples (7 Apr 1969, 13 Apr 1975), plus 19, 22 and a total above 22 |
| Card meanings | Upright and reversed meaning for all 78 cards, Waite's additional meanings, his table of recurring ranks, and spread-pattern notes (suit, Major Arcana, court cards, reversals). Shown under "More about this card". | Transcribed verbatim from A.E. Waite, *The Pictorial Key to the Tarot* (1911), public domain |
| Interpretations | Every card: a plain-English reading upright and reversed, in love (both ways), for work and money (both ways), and what is in the picture. Every one of the 3,003 pairs of cards: what the two say together. Every pair also has a love version and a work-and-money version of its pair reading (3,003 each). A **Reading about** switch (General, Love, Work and money) picks which text leads; the Love spread starts on Love. Pair readings load only when a reading needs them. | Sample text, see below. Coverage tested: 78 × 7 sections, all 3,003 pairs, love and work for all 3,003 pairs |
| Card correspondences | Every card's element, astrology and number, shown under each card in a reading. The Golden Dawn attributions (Book T, c. 1888; the same tables in Crowley's *777*, 1909), the system the 1909 deck was made in: Majors to the twelve signs, seven planets and three elements (Fool Air, Hanged Man Water, Judgement Fire, with the modern Uranus, Neptune, Pluto noted); pips Two to Ten to the 36 decans, planets in Chaldean order from Mars at 0° Aries; Kings, Queens and Knights to 30° spans from 20° of one sign to 20° of the next (Golden Dawn Knight = King here, Prince = Knight here, Princess = Page, the usual Rider-Waite-Smith mapping); Aces and Pages carry no sign. Numbers as printed on the 1909 cards (Strength 8, Justice 11); courts carry none. | All 78 checked against the published Golden Dawn table, typed into the test independently of the code; court spans tile the zodiac |
| Reading it through | Once a spread of two or more cards is complete, it is read as a whole by fixed rules: each card's keywords in its position's role (past, obstacle, advice, you, them and so on; Celtic Cross positions mapped to Waite's; zodiac houses with their area of life), one sentence that walks the spread in order naming every card, a written bridge sentence for each pair of positions the spread reads together (the thread between those two cards), rules of each spread's own (zodiac: Major Arcana by house, a card at home in its house's sign; love: you and them on one element, one side reversed, a court card in their place; situation-obstacle-advice: a Major or reversed card as the advice; full moon: the Moon's own cards, a reversed card to release; Celtic Cross: a court card or a shared element at the end), the leading and missing elements, Golden Dawn elemental dignities between the positions the spread pairs up (Fire against Water, Air against Earth), rising or falling numbers and reversals turning from past to future, signs and planets that repeat, repeated numbers read as angel numbers (two 3s = 33, three = 333), and the spread's total reduced to a Major Arcana card (while above 22 add the digits; 22 = The Fool; 11 and 22 flagged as master numbers; courts left out). | Worked examples tested (3+3+3 = 9, The Hermit; 19+21+10 = 50, 5, The Hierophant; 20+2 = 22, The Fool); every spread composed 200 times at random with no gaps; the story names every card in every spread; bridges appear for exactly the spread's own pairs, right after the story; each spread rule tested on a worked example |
| Moon tracker | Phase angle, illumination, moon sign, next new and full, month calendar, drawn moon with maria and craters | Almanac full moon 3 Jan 2026; every 2026 new/full moon vs Astronomy Engine (worst 3 min) |
| Birth chart | Natal chart from date, time and place: chart wheel (AstroChart, MIT, vendored), ten bodies with sign, house, retrograde and essential dignity, Ascendant, MC, mean node, south node, Black Moon Lilith (mean apogee), Chiron (NASA JPL Horizons orbit 1900-2100, `js/data/chiron.js`, with sign and house readings), Part of Fortune (day/night formula), house cusps with rulers, element/modality/hemisphere balance, chart ruler, every major aspect with orb and applying/separating. A written reading under the chart: the rising sign, each planet in its sign and house, and every aspect between two planets (closest six shown, the rest folded), from `js/data/natal-text.js` (477 texts, loaded on demand; sample text written for the demo). Houses: Placidus (default), Koch, Whole Sign, Equal; Placidus/Koch fall back to Porphyry above ~66° latitude and say so. Time unknown: noon positions, Moon range, no angles or houses. | Placidus, Koch and Porphyry cusps match Swiss Ephemeris within 0.1′ on 8 charts from 34°S to 70°N (`tests/fixtures/houses-swisseph.json`); Lilith within ~8′ of Swiss Ephemeris; Chiron within 0.6′ of JPL Horizons on 9 dates 1913-2077 (`tests/fixtures/chiron-horizons.json`); dignity table, balance, chart ruler and aspect order tested |
| Astrology tools | `tools.html`: solar return chart for any year, cast where the visitor is now (wheel, positions, rising sign and Sun house of the year with readings); secondary progressions with solar-arc angles, progressed Moon sign and lunar phase with their start and end dates; Saturn returns (every pass), the next Jupiter returns and lunar return; eclipses for two years with house and contacts in the chart; void-of-course Moon for seven days; planetary hours for any date and place. Texts from `js/data/tools-text.js` (94). | Eclipses 2026-27 match the NASA catalogue (date and type); solar return Sun exact to 0.001°; Saturn returns exact and at the right ages; void periods start on an exact aspect, end at an ingress and contain no exact aspect; planetary hours in Chaldean order, sunrise to sunrise; Davison midpoint in time and place |
| Vedic chart | `vedic.html`: sidereal positions with the Lahiri ayanamsa (Sun to Saturn, mean Rahu and Ketu), Lagna and whole-sign houses, Rasi (D1) and Navamsa (D9) charts drawn North or South Indian style (`js/kundli.js`), nakshatra and pada for every graha, dignity (exalted, own sign, debilitated), Vimshottari Mahadashas and Antardashas with the current one marked, birth Panchang (tithi, nakshatra, yoga, karana, vara counted from sunrise), the Manglik check from the Lagna and the Moon, Sade Sati cycles over a century. No birth time: charts from the Moon sign, uncertain Moon sign or nakshatra shown both ways. Texts from `js/data/vedic-text.js` (Lagna, Moon sign, 27 nakshatras, 9 Mahadashas, 81 Antardashas, Manglik, Sade Sati). | Ayanamsa within 0.3" and grahas within 0.3' of Swiss Ephemeris (Lahiri, 6 charts 1962-2005), Lagna exact; nakshatra, pada and Navamsa divisions; dasha sequence, balance and 120-year total; vara before and after sunrise; every Sade Sati sign change matches a half-day brute-force search (5 charts, 100 years each) |
| Astrocartography | `astromap.html`: MC, IC, ASC and DSC lines for Sun to Pluto at the birth moment on a world map (Natural Earth 1:110m land, public domain, `js/data/world.js`), planets switchable; lines within 1,000 km of any city or any tapped point, closest first, under 300 km marked strong, with a text for each of the 40 lines. | On every ASC/DSC point Astronomy Engine's own horizon code puts the planet at 0° altitude, east or west; MC/IC points on the meridian at the right altitude; RA and declination agree with Astronomy Engine Equator() |
| The Handbook | `handbook.html`: six public-domain books bound into one book read like an ebook (`js/handbook.js`, `css/book.css`). Cover, contents by Part (The Cards, The Stars, The Moon, Stones and Talismans, Hands and Faces, Charms and Customs), a title page per book with an introduction written for the demo, chapters turned page by page (one page on a phone, a two-page spread on a wide screen; arrows, keys or swipe) or read as one scroll, three text sizes, footnotes as pop-up cards, the place remembered in this browser and in the address (`#handbook/<book>/<chapter>`). Books: Waite, *The Pictorial Key to the Tarot* (1910, 1922 printing, with its 78 plates); Ptolemy, *Tetrabiblos* (Ashmand's translation); Baughan, *The Influence of the Stars* (1889, 4th ed.); Olcott, *Star Lore of All Ages* (1911); Harley, *Moon Lore* (1885); W. T. and K. Pavitt, *The Book of Talismans, Amulets and Zodiacal Gems* (1914, 1922 ed.). Charms and Customs: six chapters chosen from those books, each with a framing note. Texts in `js/book/<id>.js`, loaded when a book is opened; details in `js/data/handbook.js`; figures in `assets/book/<id>/`. | Texts from Project Gutenberg (proofread) and Wikisource (proofread transcriptions), all public domain in the US (published before 1931) and the UK (authors and illustrator dead more than 70 years). Tests: every Part and selection points at a real chapter, chapter counts match, HTML sanitised (no scripts, styles, links out, licence boilerplate, remote images), all 824 footnote markers matched to their notes |
| Personal horoscope | From the visitor's own chart (shared with the birth chart page): the Moon and the Sun by natal house with the time each leaves it, every transit in effect (Sun to Pluto on natal Sun to Saturn, Ascendant, Midheaven; orb 2°, 1.5° for Uranus to Pluto) with building/easing and every exact pass, the next 30 days of exact hits, the year's slow transits (Jupiter to Pluto) with all passes, and the retrograde calendar. Texts from `js/data/transit-text.js` (275, loaded on demand). Any date can be chosen. | Retrograde stations for 2026 match Swiss Ephemeris within 0.45 h (`tests/fixtures/stations-2026-swisseph.json`); every hit exact to 0.01°; house ingress moments tested; all 275 texts covered |
| Compatibility, full | Both charts from date, time and place: ten bodies, mean node, Ascendant, MC, houses (Whole Sign default, Equal, Placidus, Koch), Davison chart (midpoint in time and place), 10×10 synastry grid, composite by midpoints, published heuristic score | Astrodienst chart of a Rodden-AA birth: all ten bodies within 13″, ASC and MC within 1″ |
| Horoscopes by sign | `signs.html` + `js/signs.js`: today, this week, this month and the year ahead for all twelve signs, computed from the real sky with solar houses (the sign = 1st house). Moon by house with ingress times, sign changes of Sun to Pluto, exact aspects between the moving planets, new and full moons, retrograde stations, all to the minute in the visitor's time zone. 235 texts in `js/data/signs-text.js`; the Moon, Sun and retrograde texts are shared with the personal horoscope. | Equinox 2026 to 0.6 min; Saturn-Neptune conjunction 20 Feb 2026; every aspect exact to 0.01 deg (tests/signs.test.js) |
| Reading journal | `journal.html` + `js/journal.js`: every finished card reading saved automatically with its question, notes, stats (most frequent cards, suits, reversals, spreads), search, and backup to and from a JSON file. localStorage only. | Round-trip, merge and junk-file tests (tests/journal.test.js) |
| Share and print | `js/share.js`: a finished reading drawn to a PNG in the current palette, handed to the phone's share sheet or downloaded (pull page and journal). Print stylesheet: any page prints as a light report; report pages get a Print button. | Checked in Chrome 2026-10-04 |
| Installable app | `manifest.webmanifest`, `sw.js`, `assets/app/` icons. Network first for everything, the stored copy offline; 71 files stored on install, big files stored on first use. | Chrome: no installability errors, four pages open offline (2026-10-04); tests/app.test.js |
| Learn the cards | `learn.html` + `js/learn.js`: flashcards and a four-choice quiz (names, upright and reversed keywords, Golden Dawn correspondences) for any set (all, Majors, a suit, courts, the ones you miss). Weak cards come up more; three right in a row counts as learned. localStorage only. | tests/learn.test.js |
| Your own spreads | Card pull "Make your own": a name and 1 to 10 positions, each with an optional note and role (past, obstacle, advice...), so Reading it through reads them like the built-in spreads (`js/spreads.js` TD.customSpreads, `js/reading.js` rolesOf). Row up to five cards, grid beyond. The journal keeps the spread's name and positions. | tests/custom.test.js |
| Asteroids | Ceres, Pallas, Juno and Vesta on the birth chart, from NASA JPL Horizons heliocentric vectors every 40 days, 1899-2101 (`js/data/asteroids.js`, 173 KB), interpolated like Chiron, with a reading for each in its sign (`js/data/astro-extra-text.js`). | JPL Horizons apparent longitudes at 175 dates each: worst 0.56' (tests/extras.test.js; fixture asteroids-horizons.json) |
| Good days | Tools page: the next 30 days scored for one of eight activities by published electional rules (Moon sign and phase, void-of-course Moon, Mercury and Venus retrograde, optionally the Moon's aspects to the visitor's natal planets), best five with reasons and a month strip (`js/gooddays.js`). | Mercury retrograde Oct-Nov 2026 rule, score sums (tests/extras.test.js) |
| Composite readings | Compatibility: the composite Sun, Moon, Venus and Mars read by sign. | Text coverage (tests/extras.test.js) |
| I Ching and runes | `oracle.html` + `js/oracle.js`: the three-coin method (crypto random, true 1:3:3:1 odds), changing lines and the relating hexagram, look-up of all 64. Texts: James Legge, The Yî King, SBE XVI (1882), public domain; 1-32 from Wikisource, 33-64 from the 1882 scan (archive.org wg916) corrected by hand for OCR errors only (`js/data/iching.js`; the build checks every line text names the right kind of line). 24 Elder Futhark runes drawn as SVG, one or three, nine symmetrical runes never reversed (`js/data/runes.js`). | Coin odds chi-square, King Wen figures, rune fairness (tests/oracle.test.js) |
| Compatibility, quick | Two dates only: sun element, Chinese triad, life path, modality. Weighting published. | Heuristic, and labelled as one |
| Birth time → UTC | Browser IANA time-zone data, two-pass inversion. The repeated hour when clocks go back is flagged (first occurrence used); the skipped hour is flagged. "Time unknown" mode drops houses and the Ascendant and flags the Moon if it changes sign that day. | Sydney 1974, New York 1985 (EST and EDT), London 1968 (British Standard Time), Denver 2026, Honolulu 1961, NY 2021 fold and gap |
| Birth places | 34,146 GeoNames cities (population > 15,000 or capitals) with their IANA zone, searchable offline, loaded only on pages that ask for a place. | GeoNames cities15000, CC BY 4.0 |
| Chinese | Animal and element by **both** Lunar New Year and Lichun; Four Pillars from the exact birth moment (hour pillar needs a time). | Every Lunar New Year 1901–2099 and 580 sample births vs lunar-javascript (6tail, MIT) |
| Numerology | Life path, expression, soul urge, personality, birthday, personal year. Pythagorean, reduce-components-first. | 14 Feb 1990 → life path 8 |
| Maya | Tzolk'in, Haab', Long Count on GMT 584283. Not Dreamspell. | 0.0.0.0.0 = 4 Ahau 8 Cumku; 13.0.0.0.0 = 4 Ahau 3 Kankin |

Planet positions come from **Astronomy Engine** by Don Cross (MIT), vendored at
`js/vendor/astronomy.browser.min.js` with its licence. Not Swiss Ephemeris (AGPL).

## What is placeholder, on purpose

- **Interpretations.** The card and pair readings (`js/data/interpretations.js`, `js/data/combos.js`, `js/data/combos-love.js`, `js/data/combos-work.js`, `js/data/bridges.js`) are
  sample text drafted with AI assistance for this demo, against the traditional Rider-Waite-Smith meanings
  with Waite's 1911 text as the reference, under one style guide, and machine-checked for coverage, length,
  repeated openings and sensitive wording. They are not copied from any site or book. They are generic:
  the same for everyone who draws the same cards. The Moon, numerology and tarot birth cards, Chinese,
  Maya and both compatibility modes now carry sample text too (`js/data/extra-text.js`, written 2026-10-04),
  labelled as sample text on each page. On a live site the reader's
  own writing replaces or edits all of it: that is what makes it theirs. (Nothing calls a model at runtime;
  the text is static.)
- **Card of the day for the collective.** A home-page slot for the one card the reader picks by hand each
  morning, the same for everyone. The card, its orientation, the date and the message live in
  `js/data/collective.js`, which now holds a labelled sample message for the sample card; with no message it shows the placeholder box.
- **Video and streams.** Reels row and live-reading panel on the home page, the monthly recorded
  reading in the Vault: designed empty states, labelled. No third-party embed script loads.
- **Payments and bookings.** `book.html` (session, time, question, confirm), `checkout.html` (Supporter or
  Membership), `live.html` (pay-by-the-minute room with a meter preview and a chat that goes nowhere) and
  `account.html` (sign-in by first name only, plan, sessions, chart, journal) are clickable walk-throughs that
  end at the "that button is switched off" notice. State lives in localStorage (`js/members.js`); a confirmed
  booking is stored as a labelled "demo hold". No payment integration, no keys, not even test keys, no password
  or email field, and no card field anywhere.
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
| Service worker | `sw.js` at the site root (scope = the whole demo). **Bump `VERSION` in sw.js on every publish**; the new worker deletes old caches. Registered over http(s) only, never from a file. |
| Size | The published site is about 12 MB (Pages artifact 11.6 MB, measured 2026-09-28), well under the 1 GB limit. |

This build takes no money. Production client sites that take bookings or subscriptions belong on a host
that allows commerce (Cloudflare Pages), not here.

## Tests

```
node tests/run.js
```

Plain Node, no dependencies. `tests/chart.test.js` (ephemeris, angles, time zones, houses at -34° and
+70°, time-unknown mode, aspects, midpoints), `tests/calendars.test.js` (numerology, Maya, Chinese New Year,
Four Pillars, moon phases, tarot birth cards), `tests/tools.test.js` (Chiron against JPL, solar return, progressions, returns, eclipses against NASA, void Moon, planetary hours, Davison, text coverage), `tests/handbook.test.js` (Handbook structure, sanitised book HTML, footnotes, sources, and a site-wide scan that fails on any emoji), `tests/vedic.test.js` (Lahiri positions and Lagna against Swiss Ephemeris, nakshatras, Navamsa, dashas, Panchang, Manglik, Sade Sati, text coverage), `tests/acg.test.js` (lines through Astronomy Engine's horizon code, distances, map data), `tests/transits.test.js` (stations against Swiss Ephemeris, exact hits, transits in effect, Moon and Sun by house, text coverage), `tests/natal.test.js` (dignities, balance, chart ruler, aspects, Big Three, coverage of all 477 reading texts), `tests/reading.test.js` (correspondences against the Golden Dawn table, numbers, dignities, angel numbers, the spread's total, reading it through), `tests/deck.test.js` (uniformity, persistence, Significator,
spreads, spread analysis), `tests/journal.test.js` (journal save, notes, stats, backup round-trip, junk files, blocked storage), `tests/members.test.js` (mock-up prices, calendar rules, demo holds and sign-in), `tests/signs.test.js` (solar houses, ingresses, sky aspects, Moon path, text coverage), `tests/app.test.js` (manifest, icons, the service worker stores every page and script), `tests/learn.test.js`, `tests/custom.test.js`, `tests/extras.test.js`, `tests/decks.test.js`, `tests/oracle.test.js`. The emoji scan also catches JavaScript `\u{...}` and surrogate escapes since 2026-10-04.
Reference data: `tests/fixtures/lunar-javascript-reference.json`, `tests/fixtures/stations-2026-swisseph.json`, `tests/fixtures/houses-swisseph.json`, `tests/fixtures/vedic-swisseph.json` (house cusps, stations and Lahiri positions from Swiss Ephemeris 2.10.03, numbers only; the library itself is not part of the site).

## Files

```
index.html  pull.html  moon.html  birthchart.html  vedic.html  astromap.html  horoscope.html  tools.html  compatibility.html  numerology.html  chinese.html  maya.html
handbook.html  pricing.html  404.html  journal.html  signs.html  book.html  checkout.html  live.html  account.html  learn.html  oracle.html
sw.js  manifest.webmanifest  assets/app/  the service worker, app manifest and app icons
css/base.css          design system, four palettes, all components
js/site.js            brand config, nav, footer, Customise panel, Free/Subscriber view, demo modal
js/tour.js            the guided tour
js/icons.js           the site's drawn symbols (line icons in the prism colours), so nothing renders as emoji
js/handbook.js        the Handbook reader: cover, contents, title pages, paged or scrolled chapters, footnotes
js/data/handbook.js   the Handbook's Parts, book details, introductions and chapter lists
js/book/<id>.js       the text of each hosted book, one string per chapter (loaded on demand)
css/book.css          the Handbook's bound-book look
assets/book/<id>/     the hosted books' own illustrations
js/astro.js           Meeus sun/moon: phases, moon sign, calendar (unchanged from the first demo)
js/chart.js           charts: planets, time zones, angles, houses (Placidus, Koch, Porphyry, Whole Sign, Equal), Lilith, Part of Fortune, aspects, synastry, composite
js/natal.js           birth-chart summaries: Big Three, balance, chart ruler, dignities, aspect list
js/data/natal-text.js the written birth-chart reading: planet in sign / house, rising sign, aspects (loaded on demand)
js/tools.js           astrology tools: solar return, progressions, returns, eclipses, void Moon, planetary hours, Davison
js/wheel.js           draws a chart wheel with AstroChart (birth chart, solar return)
js/data/chiron.js     Chiron's orbit from NASA JPL Horizons, 1900-2100
js/data/tools-text.js texts for the astrology tools and Chiron (loaded on demand)
js/vedic.js           Vedic chart: Lahiri ayanamsa, sidereal grahas, nakshatras, Navamsa, Vimshottari dashas, Panchang, Manglik, Sade Sati
js/kundli.js          draws the Vedic chart, North or South Indian style (SVG)
js/acg.js             astrocartography: planet lines, lines near a place
js/data/world.js      land outlines for the map (Natural Earth, public domain)
js/data/vedic-text.js texts for the Vedic chart and astrocartography (loaded on demand)
js/transits.js        personal horoscope: transit hits, transits in effect, stations, Sun and Moon by house
js/data/transit-text.js the personal-horoscope texts (loaded on demand)
js/places.js          birth-place search over js/data/cities.js
js/journal.js         the reading journal (localStorage tarotdemo.journal)
js/members.js         the mock account, sessions and demo holds behind book/checkout/live/account
js/signs.js           horoscopes by sign: solar houses, ingresses, Moon path, sky aspects, lunations
js/data/signs-text.js the texts for horoscopes by sign
js/share.js           a finished reading as a PNG, shared or downloaded
js/data/extra-text.js sample texts for the Moon, numerology, birth cards, Chinese, Maya, compatibility
js/learn.js           flashcards and quiz logic (localStorage tarotdemo.learn)
js/gooddays.js        good days for an activity, by published rules
js/oracle.js          I Ching coins and rune draws, hexagram and rune drawings
js/data/asteroids.js  Ceres, Pallas, Juno, Vesta from NASA JPL Horizons
js/data/astro-extra-text.js  asteroid-in-sign and composite texts
js/data/iching.js     the 64 hexagrams with Legge's 1882 text
js/data/runes.js      the 24 Elder Futhark runes
js/deck.js            the persistent deck, Significator, spread analysis, card back
js/reading.js         reading it through: positions, elements, dignities, movement, repeated numbers, the spread's total
js/spreads.js         the eight spreads; Celtic Cross positions in Waite's words
js/cards.js           78 cards, keywords, card faces
js/chinese.js         zodiac by both boundaries, Lunar New Year, Four Pillars
js/numerology.js  js/maya.js  js/moonviz.js
js/data/meanings.js   Waite's meanings, recurrence table, spread notes
js/data/cities.js     generated by tools/build-cities.py from GeoNames
js/data/collective.js today's card for the collective: the reader edits this by hand
js/data/correspondences.js  Golden Dawn element, astrology and number for every card (attached to TD.DECK)
js/data/interpretations.js  sample readings for every card: general, love, work and money, picture
js/data/combos.js     sample readings for all 3,003 pairs (loaded on demand)
js/data/combos-love.js  love readings for all 3,003 pairs (loaded on demand)
js/data/combos-work.js  work and money readings for the same pairs (loaded on demand)
js/data/bridges.js    one bridge sentence for each of the 3,003 pairs, used in Reading it through (loaded on demand)
js/vendor/            Astronomy Engine and AstroChart (chart wheel), each with its licence
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

1. ~~All four palettes are dark.~~ Closed 2026-10-05: the Daylight palette (`[data-theme="light"]` in `css/base.css`) overrides every hard-coded dark colour.
2. **Firefox from a file** is untested: served, it behaves like any static site.
3. **The Handbook is assembled in the browser.** Its chapters load by script, which suits reading but not search
   engines (and the demo is `noindex` anyway). For a live site that wants search traffic from the books, generate one
   plain HTML page per chapter from the same `js/book/*.js` files at build time and link the reader to them.
