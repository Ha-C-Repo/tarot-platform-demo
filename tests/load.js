// Loads the site's classic scripts into a sandbox that looks enough like a browser window
// for the maths to run under Node. Used by every test in this folder.
const vm = require('vm'), fs = require('fs'), path = require('path');
module.exports = function load(files, extra = {}){
  const root = path.join(__dirname, '..');
  const ctx = Object.assign({ console, Intl, Date, Math, crypto: require('crypto').webcrypto, TextEncoder, setTimeout }, extra);
  ctx.window = ctx; ctx.self = ctx; ctx.globalThis = ctx;
  vm.createContext(ctx);
  files.forEach(f => vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f }));
  return ctx;
};
