# Card images

The demo ships without the 78 tarot scans. Each card falls back to a typographic face, so the site
is complete and presentable as-is. Run the script below on a machine with normal internet access to
drop in the real 1909 artwork.

## What to fetch

**Rider-Waite-Smith, 1909.** Illustrations by Pamela Colman Smith, designed by A.E. Waite,
published by William Rider & Son.

- Published 1909, so **public domain in the United States**.
- Pamela Colman Smith died 1951, so also **public domain in life+70 countries since 1 January 2022**.

Two things that are NOT public domain:

1. **Modern recoloured and restored editions** are separate copyrighted works. Use scans of the
   original 1909 printing only.
2. **"Rider-Waite" and "Rider-Waite-Smith" are used as trademarks** by US Games Systems. Naming the
   deck factually in a credit line is fine; using it as product branding is not.

## Where

- **Preferred:** Wikimedia Commons, category `Rider-Waite tarot deck`. Per-file licence metadata,
  which is what you want on record.
- **Cross-check:** `archive.sacred-texts.com/tarot/` carries the 1909 scans and states they are
  "unambiguously in the public domain in the United States". The cross-reference at `/tarot/xr/`
  enumerates all 78.

## Naming

Drop files here using exactly these names (the demo looks for them):

```
major-00-fool.jpg  major-01-magician.jpg  ...  major-21-world.jpg
wands-01-ace.jpg   wands-02-two.jpg  ...  wands-11-page.jpg  wands-12-knight.jpg
wands-13-queen.jpg wands-14-king.jpg
cups-01-ace.jpg ... swords-01-ace.jpg ... pentacles-01-ace.jpg ...
```

`fetch-cards.sh` prints the full list. Enumerate the real filenames from the source index rather than
guessing them, fetch once, rate-limited, and record source URL and licence per file. Do not hotlink and
do not crawl.
