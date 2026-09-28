#!/usr/bin/env node
// Runs every *.test.js in this folder. Plain Node, no dependencies, no npm:
//   node tests/run.js
// Each test file exports an array of [name, fn]; fn throws on failure.
const fs = require('fs'), path = require('path');
let pass = 0, fail = 0;
const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.test.js')).sort();
for (const f of files) {
  const tests = require(path.join(__dirname, f));
  console.log('\n' + f);
  for (const [name, fn] of tests) {
    const t0 = Date.now();
    try { const note = fn(); pass++; console.log(`  ok    ${name}${note ? '  (' + note + ')' : ''}  ${Date.now() - t0}ms`); }
    catch (e) { fail++; console.log(`  FAIL  ${name}\n        ${e.message}`); }
  }
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
