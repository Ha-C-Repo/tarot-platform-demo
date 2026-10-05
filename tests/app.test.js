// The installable app: the manifest is valid and its icons exist; the service worker stores every page and script.
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const assert = (c, msg) => { if (!c) throw new Error(msg); };
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const PRECACHE = eval(sw.match(/const PRECACHE = (\[[\s\S]*?\]);/)[1]);

module.exports = [
  ['Manifest: valid JSON, standalone, icons 192 and 512 plus a maskable one, all present', () => {
    const m = JSON.parse(fs.readFileSync(path.join(root, 'manifest.webmanifest'), 'utf8'));
    assert(m.name && m.short_name && m.start_url && m.display === 'standalone', 'fields');
    ['192x192', '512x512'].forEach(s => assert(m.icons.some(i => i.sizes === s && i.type === 'image/png'), 'icon ' + s));
    assert(m.icons.some(i => i.purpose === 'maskable'), 'maskable');
    m.icons.forEach(i => assert(fs.existsSync(path.join(root, i.src)), 'missing ' + i.src));
    (m.shortcuts || []).forEach(s => assert(fs.existsSync(path.join(root, s.url.replace('./', ''))), 'shortcut ' + s.url));
  }],
  ['Service worker stores every page and every script, and every file it lists exists', () => {
    PRECACHE.forEach(p => assert(p === './' || fs.existsSync(path.join(root, p)), 'listed but missing: ' + p));
    fs.readdirSync(root).filter(f => f.endsWith('.html')).forEach(f => assert(PRECACHE.includes(f), 'page not stored: ' + f));
    fs.readdirSync(path.join(root, 'js')).filter(f => f.endsWith('.js')).forEach(f => assert(PRECACHE.includes('js/' + f), 'script not stored: js/' + f));
    assert(new Set(PRECACHE).size === PRECACHE.length, 'duplicate entry');
    return PRECACHE.length + ' files';
  }],
  ['Every page except 404 loads site.js, which adds the manifest link over http(s) only', () => {
    const site = fs.readFileSync(path.join(root, 'js/site.js'), 'utf8');
    assert(/ln.rel = 'manifest'; ln.href = 'manifest.webmanifest'/.test(site), 'site.js does not add the manifest');
    fs.readdirSync(root).filter(f => f.endsWith('.html') && f !== '404.html').forEach(f => {
      const h = fs.readFileSync(path.join(root, f), 'utf8');
      assert(h.includes('<script src="js/site.js"></script>'), 'no site.js: ' + f);
      assert(!h.includes('rel="manifest"'), 'static manifest link (errors from file://): ' + f);
    });
  }],
];
