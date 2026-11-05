const fs = require('node:fs');
const assert = require('node:assert/strict');

const pages = ['index.html', 'kernel-details.html', 'portfolio-details.html', 'service-details.html', 'starter-page.html'];
const labels = ['Beranda', 'Tentang', 'Struktur Perusahaan', 'Tujuan', 'Operasional', 'Galeri', 'Kontak'];
const ids = ['hero', 'about', 'struktur-perusahaan', 'features', 'services', 'portfolio', 'contact'];
const html = Object.fromEntries(pages.map(file => [file, fs.readFileSync(file, 'utf8')]));

for (const [file, source] of Object.entries(html)) {
  assert.doesNotMatch(source, /id="scroll-top"/, `${file}: scroll-to-top removed`);
  assert.doesNotMatch(source, /href="https?:\/\/(?:www\.)?ptpn4\.co\.id/i, `${file}: no links to official website`);
  assert.match(source, /href="assets\/img\/ptpn4-logo\.png" rel="icon"/, `${file}: PTPN IV favicon`);
  if (file === 'index.html') assert.doesNotMatch(source, /<a[^>]*class="footer-brand"/i, `${file}: main footer logo inactive`);
  else assert.match(source, /<a href="index.html" class="footer-brand"/, `${file}: footer logo links home`);
  const nav = source.match(/<nav id="navmenu"[\s\S]*?<\/nav>/)?.[0];
  assert.ok(nav, `${file}: primary navigation exists`);
  const links = [...nav.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)];
  assert.deepEqual(links.map(([, , text]) => text.replace(/<[^>]*>/g, '').trim()), labels, `${file}: nav order`);
  assert.deepEqual(links.map(([, href]) => href), ids.map(id => file === 'index.html' ? `#${id}` : `index.html#${id}`), `${file}: nav targets`);
}

const home = html['index.html'];
const gallery = home.match(/<section id="portfolio"[\s\S]*?<\/section>/)?.[0];
assert.ok(gallery, 'home: gallery exists');
const cards = [...gallery.matchAll(/<div class="col-lg-4 col-md-6 portfolio-item[\s\S]*?<\/div><!-- End Portofolio Item -->/g)];
assert.equal(cards.length, 10, 'home: all ten gallery cards retained');
for (const [index, [card]] of cards.entries()) assert.match(card, /class="[^"]*glightbox[^"]*gallery-zoom-link|class="[^"]*gallery-zoom-link[^"]*glightbox/, `gallery card ${index + 1}: zoom control`);
assert.doesNotMatch(home, /Bersama bertumbuh untuk agribisnis berkelanjutan|id="call-to-action"/);
assert.match(fs.readFileSync('assets/css/professional.css', 'utf8'), /\.hero \.hero-buttons \.btn\.btn-outline:hover[\s\S]*?background:\s*var\(--gold\)/);
assert.ok(fs.readFileSync("assets/css/professional.css", "utf8").includes("text-align: justify !important"));
console.log('PASS: navigation, internal destinations, gallery zoom, links, logos, removed sections/buttons, and styling');
