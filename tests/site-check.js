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
  if (file === 'index.html') {
    assert.doesNotMatch(source, /<a\b[^>]*class="logo d-flex align-items-center"/i, `${file}: header logo inactive`);
    assert.doesNotMatch(source, /<a\b[^>]*class="footer-brand"/i, `${file}: main footer logo inactive`);
  }
  else assert.match(source, /<a href="index.html" class="footer-brand"/, `${file}: footer logo links home`);
  const nav = source.match(/<nav id="navmenu"[\s\S]*?<\/nav>/)?.[0];
  assert.ok(nav, `${file}: primary navigation exists`);
  const links = [...nav.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)];
  assert.deepEqual(links.map(([, , text]) => text.replace(/<[^>]*>/g, '').trim()), labels, `${file}: nav order`);
  assert.deepEqual(links.map(([, href]) => href), ids.map(id => file === 'index.html' ? `#${id}` : `index.html#${id}`), `${file}: nav targets`);
}

const home = html['index.html'];
const featureImages = {
  'features-tab-1': 'assets/img/gambar%20cpo%202.png',
  'features-tab-2': 'assets/img/Gambar%20keunggulan%20operasional.png',
  'features-tab-3': 'assets/img/gambar%20Kegiatan%20Pendidikan%20dan%20Pengembangan.png',
  'features-tab-4': 'assets/img/Gambar%20keberlanjutan%202.png'
};
for (const [tabId, image] of Object.entries(featureImages)) {
  assert.match(home, new RegExp(`id="${tabId}"[\\s\\S]*?src="${image}"`), `${tabId}: image matches adjacent text`);
}
assert.doesNotMatch(home, /src="assets\/img\/features\/features-[14]\.webp"/, 'strategy tabs do not use unrelated stock images');
const serviceCards = [...home.matchAll(/<article class="service-card h-100">[\s\S]*?<\/article>/g)].map(([card]) => card);
const serviceImageFiles = ['assets/img/foto%20cover%20pengolahan%20minyak%20cpo%202.png', 'assets/img/foto%20tangki%20cpo', 'assets/img/gambar%20biji%20kernels.png'];
for (const image of serviceImageFiles) assert.equal(home.includes(`src="${image}"`), true, `${image}: local service image referenced`);
const galleryImageTopics = {
  'Gambar%20keberlanjutan%201.png': 'Pengelolaan Hasil Samping Sawit',
  'Gambar%20keberlanjutan%202.png': 'Pengelolaan Limbah Cair',
  'Gambar%20keberlanjutan%203.png': 'Penghijauan dan Penanaman Pohon',
  'Gambar%20keberlanjutan%204.png': 'Diskusi Teknis Instalasi Proses',
  'Gambar%20keberlanjutan%205.png': 'Aksi Bersih Lingkungan'
};
for (const [image, title] of Object.entries(galleryImageTopics)) {
  assert.match(home, new RegExp(`<img src="assets/img/${image}"[\\s\\S]*?<h3>${title}</h3>`), `${title}: gallery image matches adjacent topic`);
}
for (const [title, image] of Object.entries({
  'Pengolahan TBS': 'assets/img/foto%20cover%20pengolahan%20minyak%20cpo%202.png',
  'Minyak Sawit Mentah (CPO)': 'assets/img/foto%20tangki%20cpo',
  'Inti Sawit (Kernel)': 'assets/img/gambar%20biji%20kernels.png'
})) {
  const card = serviceCards.find(source => source.includes(`<h3>${title}</h3>`));
  assert.ok(card, `${title}: service card exists`);
  assert.match(card, /<img\b[^>]*src="[^"]+"/, `${title}: image exists beside text`);
}
const gallery = home.match(/<section id="portfolio"[\s\S]*?<\/section>/)?.[0];
assert.ok(gallery, 'home: gallery exists');
const cards = [...gallery.matchAll(/<div class="col-lg-4 col-md-6 portfolio-item[\s\S]*?<\/div><!-- End Portofolio Item -->/g)];
assert.equal(cards.length, 10, 'home: all ten gallery cards retained');
for (const [index, [card]] of cards.entries()) assert.match(card, /class="[^"]*glightbox[^"]*gallery-zoom-link|class="[^"]*gallery-zoom-link[^"]*glightbox/, `gallery card ${index + 1}: zoom control`);
assert.doesNotMatch(home, /Bersama bertumbuh untuk agribisnis berkelanjutan|id="call-to-action"/);
assert.match(fs.readFileSync('assets/css/professional.css', 'utf8'), /\.hero \.hero-buttons \.btn\.btn-outline:hover[\s\S]*?background:\s*var\(--gold\)/);
const professionalCss = fs.readFileSync('assets/css/professional.css', 'utf8');
assert.ok(professionalCss.includes('text-align: justify !important'));
assert.match(professionalCss, /#hero \.hero-content p\s*\{\s*text-align:\s*center\s*!important;\s*\}/, 'hero description is explicitly centered');
console.log('PASS: navigation, internal destinations, gallery zoom, links, logos, removed sections/buttons, and styling');
