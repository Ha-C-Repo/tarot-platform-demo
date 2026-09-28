#!/usr/bin/env bash
# Prints the 78 filenames the demo expects. Pair each with a source URL you have
# confirmed yourself, then fetch politely (one at a time, with a pause).
set -euo pipefail
majors=(fool magician high-priestess empress emperor hierophant lovers chariot strength hermit
        wheel-of-fortune justice hanged-man death temperance devil tower star moon sun judgement world)
for i in "${!majors[@]}"; do printf 'major-%02d-%s.jpg\n' "$i" "${majors[$i]}"; done
ranks=(ace two three four five six seven eight nine ten page knight queen king)
for suit in wands cups swords pentacles; do
  for i in "${!ranks[@]}"; do printf '%s-%02d-%s.jpg\n' "$suit" "$((i+1))" "${ranks[$i]}"; done
done
