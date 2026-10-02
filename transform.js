// transform.js — Addis Chicken x TARQ Studio (Next.js snapshot) rebrand. Idempotent, complete, clean.
// Strategy: rendered-DOM snapshot + kill hydration (strip all Next scripts) + normalize baked states +
// inline CSS chunks with base64 fonts + relabel everything + route media local.
const fs = require('fs');
const BUILD = 'C:/Users/anani/AppData/Local/Temp/opencode/addis-tarq/';
const OUT = 'C:/Users/anani/Playground/addis-chicken-2/';

let html = fs.readFileSync(BUILD + 't.prettyB.html', 'utf8').replace(/\r\n/g, '\n');
const log = [];
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const rep = (find, replaceWith, name) => {
  const n = html.split(find).length - 1;
  log.push(`${name}: ${n}${n ? '' : '  <<< MISS'}`);
  html = html.split(find).join(replaceWith);
};
const repRe = (rx, replaceWith, name) => {
  const n = (html.match(rx) || []).length;
  log.push(`${name}: ${n}${n ? '' : '  <<< MISS'}`);
  html = html.replace(rx, replaceWith);
};
const repOrdered = (rx, fn, name) => {
  let i = 0;
  const n = (html.match(rx) || []).length;
  // handlers receive (match, ordinalIndex, group1, group2, ...)
  html = html.replace(rx, (m, ...rest) => fn(m, i++, ...rest.slice(0, rest.length - 2)));
  log.push(`${name}: ${n}${n ? '' : '  <<< MISS'}`);
};
// text-node swap with whitespace + entity tolerance
const repT = (from, to, name) => {
  const rx = new RegExp('>\\s*' + esc(from).replace(/&/g, '(?:&|&amp;)') + '\\s*<', 'g');
  const n = (html.match(rx) || []).length;
  log.push(`${name}: ${n}${n ? '' : '  <<< MISS'}`);
  html = html.replace(rx, '>' + to + '<');
};
const b64 = f => fs.readFileSync(BUILD + f).toString('base64');

// ============================ P0 — kill hydration ============================
// strip scripts per-tag (never span across </script>) using content signatures
let scriptKills = 0;
html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/g, block => {
  const sig = block.slice(0, 900);
  if (/src="\/_next\//.test(sig) || /src="https:\/\/tracker\.metricool\.com/.test(sig) || /self\.__next_f/.test(block) || /\$R[TBV]\s*=/.test(block) || /requestAnimationFrame\(function \(\) \{ \$RT/.test(block)) { scriptKills++; return ''; }
  return block;
});
log.push('P0 script kills: ' + scriptKills);
// link-level kills (preloads into removed chunks/trackers)
repRe(/[ \t]*<link[^>]*href=["']?https:\/\/tracker\.metricool\.com[^"'\s>]*["']?[^>]*>\n?/g, () => '', 'P0 metricool links');
repRe(/[ \t]*<link[^>]*href=["']?\/_next\/[^"'\s>]*["']?[^>]*>\n?/g, () => '', 'P0 _next links');
repRe(/[ \t]*<next-route-announcer[^>]*><\/next-route-announcer>/g, () => '', 'P0 route announcer');
repRe(/[ \t]*<script src=""\/_vercel\/insights\/[^"]*"[^>]*><\/script>\n?/g, () => '', 'P0 vercel insights');
repRe(/<script[^>]*src="\/_vercel\/insights[^"]*"[^>]*><\/script>\n?/g, () => '', 'P0 vercel insights final');
repRe(/[ \t]*<div id="awwwards"[^>]*>[\s\S]*?<\/a>\s*<\/div>/g, () => '', 'P0 awwwards badge div');

// ============================ P1 — head meta ============================
rep('<title>Arquitectura e interiorismo</title>', '<title>My Chicken Addis | Modern & Profitable Poultry Farming in Ethiopia</title>', 'P1 title');
rep('<html lang="es" style="touch-action: pan-x pinch-zoom; scroll-behavior: auto;">', '<html lang="en">', 'P1 lang');
rep('content="Arquitectura e interiorismo"', 'content="My Chicken Addis | Modern & Profitable Poultry Farming in Ethiopia"', 'P1 og/tw title');
repRe(/content="Estudio de arquitectura e interiorismo[^"]*"/g, () => 'content="Your trusted guide for modern, healthy, and profitable poultry farming in Ethiopia. Practical training, modern 4-tier cage systems, feed formulation, and farm consultation."', 'P1 desc metas');
repRe(/<link rel="canonical" href="https:\/\/tarqstudio\.com\/es"[^>]*>/g, () => '<link rel="canonical" href="https://addis-chicken.vercel.app/">', 'P1 canonical');
repRe(/content="https:\/\/tarqstudio\.com\/es"/g, () => 'content="https://addis-chicken.vercel.app/"', 'P1 og url refs');
rep('<h1 class="visually-hidden">Arquitectura e interiorismo</h1>', '<h1 class="visually-hidden">My Chicken Addis — practical poultry training in Addis Ababa</h1>', 'P1 hidden h1');
rep('content="TARQ"', 'content="My Chicken Addis"', 'P1 site name');
rep('content="es_ES"', 'content="en_US"', 'P1 locale');
rep('content="https://tarqstudio.com/tarq-architecture-studio.avif"', 'content="https://addis-chicken.vercel.app/assets/careerBox.jpg"', 'P1 og image');
rep('content="TARQ Architecture and Interior Design"', 'content="My Chicken Addis - practical poultry training, cage systems, feed formulation"', 'P1 og image alt');
repRe(/[ \t]*<link rel="alternate"[^>]*>\n?/g, () => '', 'P1 hreflang links');
repRe(/[ \t]*<link rel="icon" href="\/favicon\.svg"[^>]*>\n?/g, () => '<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 64 64%27%3E%3Crect width=%2764%27 height=%2764%27 rx=%2712%27 fill=%27%23161a1b%27/%3E%3Ccircle cx=%2744%27 cy=%2744%27 r=%274%27 fill=%27%23E2572E%27/%3E%3Ctext x=%2732%27 y=%2742%27 font-family=%27Georgia,serif%27 font-style=%27italic%27 font-weight=%27700%27 font-size=%2730%27 text-anchor=%27middle%27 fill=%27%23F2EFE4%27%3EAC%3C/text%3E%3C/svg%3E">\n', 'P1 favicon');

// ============================ P2 — inline CSS chunks with base64 fonts ============================
const CSS_FILES = ['dl-0z2_.nckrkgbw.css', 'dl-16x66pynhixzy.css', 'dl-0kzdekp4685_0.css', 'dl-0o7s_nivrs1sq.css'];
let cssOut = CSS_FILES.map(f => fs.readFileSync(BUILD + f, 'utf8')).join('\n');
const FONTMAP = [
  ['AktivGroteskEx_Trial_Rg-s.p.00nj5ihncjqfq.ttf', 'dl-AktivGroteskEx_Trial_Rg-s.p.00nj5ihncjqfq.ttf', 'ttf'],
  ['AktivGrotesk_Trial_Lt-s.p.0l-8~znd.6g07.ttf', 'dl-AktivGrotesk_Trial_Lt-s.p.0l-8_znd.6g07.ttf', 'ttf'],
  ['AktivGrotesk_Trial_Rg-s.p.17yak..beus_m.ttf', 'dl-AktivGrotesk_Trial_Rg-s.p.17yak..beus_m.ttf', 'ttf'],
  ['AwesomeSerifItalic_Regular-s.p.0c.z9pf4ezbqy.otf', 'dl-AwesomeSerifItalic_Regular-s.p.0c.z9pf4ezbqy.otf', 'otf'],
];
FONTMAP.forEach(([remote, local, ext]) => {
  const pat = 'url(../media/' + remote + ')';
  const n = cssOut.split(pat).length - 1;
  cssOut = cssOut.split(pat).join('url(data:font/' + ext + ';base64,' + b64(local) + ')');
  log.push('P2 font ' + remote.slice(0, 22) + ' x' + n);
});
repRe(/[ \t]*<link rel="stylesheet" href="\/_next\/static\/chunks\/[^"]*\.css"[^>]*>\n?/g, () => '', 'P2 css links');
repRe(/[ \t]*<link rel="preload"[^>]*href="\/_next\/static\/media\/[^"]*"[^>]*>\n?/g, () => '', 'P2 font preload links');
const BRAND_CSS = [
  '/* My Chicken Addis brand layer */',
  '#mobile-menu-overlay[aria-hidden="false"]{opacity:1!important;pointer-events:auto!important;visibility:visible!important}',
  '#mobile-menu-overlay[aria-hidden="true"]{opacity:0!important;pointer-events:none!important}',
  'a[href^="#"],.hero-next-project{cursor:pointer}',
  '.hero-bg-current{transition:background-image .5s ease}',
  '@media screen and (max-width: 768px){.pin-spacer{height:auto!important;width:100%!important;display:block!important;float:none!important}.pin-spacer>*{max-width:100%!important;width:100%!important;max-height:none!important;height:auto!important}[class*=__section],section{max-width:100vw!important;width:auto!important}}',
  '[class*=__titleWrapper]{width:auto!important;display:inline-block}',
].join('\n');
replInlineCss();
function replInlineCss() {
  rep('</title>', '</title>\n  <style>\n' + cssOut + '\n' + BRAND_CSS + '\n</style>', 'P2 inline css');
}

// ============================ P3 — normalize baked states ============================
repRe(/<body class="(aktivgrotesklight[^"]+)" style="[^"]*">/g, (m, g) => '<body class="' + g + '">', 'P3 body strip');
repRe(/<div id="smooth-wrapper"[^>]*style="[^"]*">/g, () => '<div id="smooth-wrapper">', 'P3 smooth wrapper');
repRe(/<div id="smooth-content"[^>]*style="[^"]*">/g, () => '<div id="smooth-content">', 'P3 smooth content');
repRe(/<div class="pin-spacer"[^>]*style="[^"]*">/g, () => '<div class="pin-spacer">', 'P3 pin spacers');
repRe(/<section class="hero-section panel" data-navbar-transparent="true"[^>]*style="[^"]*">/g, () => '<section class="hero-section panel" data-navbar-transparent="true">', 'P3 hero section');
repRe(/<section class="(panel-container panel)"[^>]*style="[^"]*">/g, (m, g) => '<section class="' + g + '">', 'P3 panel container styles');
// baked gsap reveal states on text (they hide content until React animates -> strip them)
repRe(/(<(?:span|p|h2|h3|div|a)\b[^>]*?) style="translate: none; rotate: none; scale: none; transform: translate\([^;"]*\);[^"]*"/g, (m, g) => g, 'P3 gsap translate reveal strips');
repRe(/ style="transform: translateX\(-100%\);"/g, () => '', 'P3 reveal left strips');
repRe(/ style="transform: translateX\(100%\);"/g, () => '', 'P3 reveal right strips');
repRe(/ style="clip-path: inset\(0px 100% 0px 0px\);"/g, () => '', 'P3 strip sedes clip');

// ============================ P4 — nav + brand ============================
rep('aria-label="TARQ, inicio"', 'aria-label="My Chicken Addis, home"', 'P4 brand aria');
repRe(/<svg width="43" height="48" viewBox="0 0 43 48" fill="none" xmlns="http:\/\/www\.w3\.org\/2000\/svg">[\s\S]*?<\/svg>/,
  () => '<svg width="43" height="48" viewBox="0 0 43 48" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><text x="1" y="21" font-family="Georgia, serif" font-style="italic" font-weight="700" font-size="16">ADDIS</text><text x="1" y="42" font-family="Georgia, serif" font-style="italic" font-weight="700" font-size="16">CHICKEN</text></svg>', 'P4 logo svg');
repT('Nosotros', 'Overview', 'P4 nosotros');
repT('Proyectos', 'Cohorts', 'P4 proyectos');
repT('Prensa', 'Stories', 'P4 prensa');
repT('Servicios', 'Pathway', 'P4 servicios');
repT('Contacto', 'Contact', 'P4 contacto');
repT('Inicio', 'Home', 'P4 inicio');
// nav hrefs -> anchors
rep('href="/es/studio"', 'href="#story"', 'P4 href studio');
rep('href="/es/projects"', 'href="#menu"', 'P4 href projects');
rep('href="/es/press"', 'href="#stories"', 'P4 href press');
rep('href="/es/services"', 'href="#process"', 'P4 href services');
rep('href="/es/contact"', 'href="#contact"', 'P4 href contact');
rep('href="/es"', 'href="#top"', 'P4 bare /es');

// ============================ P5 — hero ============================
rep('<span class="hero-year">2026</span>', '<span class="hero-year">Next batch: open</span>', 'P5 hero year');
rep('>Casa Decor x Dos Latitudes<', '>Weekend Poultry Intensive<', 'P5 hero title text');
repT('TARQ es un estudio de arquitectura y diseño que entiende cada proyecto como una experiencia por construir, no sólo como un objeto terminado.', 'My Chicken Addis is a practical poultry training farm — protocols, cage systems, feed formulation, and financing for profitable Ethiopian flocks.', 'P5 hero desc');
repT('Ver Proyecto', 'Enroll Now', 'P5 hero cta');
repT('Siguiente proyecto', 'Next cohort', 'P5 hero next');

// ============================ P6 — studio section ============================
rep('>THE<', '>THE<', 'P6 studio title A');
rep('>STUDIO<', '>FARM<', 'P6 studio title B');
repT('Un estudio de arquitectura e interiorismo que transforma espacios y diseña experiencias.', 'A poultry training farm grounded in real flock management — brooding, cages, feed, and market.', 'P6 studio desc1');
repT('Desarrollamos proyectos que expresan funcionalidad y dinamismo, personificando a nuestros clientes en cada trazo del plano.', 'From day-old chick brooding to 4-tier cage setups and local feed formulation — every protocol is field-tested at our Addis Ababa farm.', 'P6 studio desc2');
repT('Conoce nuestro estudio', 'Book a site visit', 'P6 studio cta');
repT('Bogotá', 'Megenagna Center', 'P6 sede 1');
repT('Madrid', '400-Bird Units', 'P6 sede 2');
repT('Miami', '1,500+ Trained', 'P6 sede 3');

// ============================ P7 — projects -> menu highlights ============
rep('>PROYECTOS<', '>COHORTS<', 'P7 proj title A');
rep('>DESTACADOS<', '>&amp; INTAKES<', 'P7 proj title B');
repT('Explora todos los proyectos', 'See all intakes', 'P7 projects cta');
repT('Ver más', 'View', 'P7 ver mas');
const CARD = [['Casa Decor x Dos Latitudes', 'Weekend Intensive', '3 days'],
  ['Punta Mar', 'Commercial Masterclass', '4 weeks'],
  ['Salesas ', '4-Tier Cage Setup', 'Turnkey'],
  ['Irimaka', 'Feed Formulation', '30% savings'],
  ['Ph Makaira', 'Broiler Production', 'Meat birds'],
  ['Casa NJ', 'Farm Financing', 'Start or expand']];
CARD.forEach(([from, to, tag]) => {
  repT(from, to, 'P7 name ' + from);
  rep('alt="' + from + '"', 'alt="' + to + '"', 'P7 name alt ' + from);
});
CARD.forEach(([from, to, tag]) => {
  repT(from, to, 'P7 name ' + from);
  rep('alt="' + from + '"', 'alt="' + to + '"', 'P7 name alt ' + from);
});
// freshness tags in the year slot
const TAGS = ['3 days', '4 weeks', 'Turnkey', '30% savings', 'Meat birds', 'Flexible'];
let tagN = 0;
html = html.replace(/(<span class="ProjectItem-module__zYQwxW__year"[^>]*>)[^<]*(<\/span>)/g, (m, a, b) => a + TAGS[Math.min(tagN++, TAGS.length - 1)] + b);
log.push('P7 year tags x' + tagN);
const TYPES = ['Counter', 'By the kilo', 'Boneless', 'Spice-rubbed', 'Catered'];
let typN = 0;
html = html.replace(/(<div class="ProjectItem-module__zYQwxW__type"[^>]*>)[^<]*(<\/div>)/g, (m, a, b) => a + TYPES[Math.min(typN++, TYPES.length - 1)] + b);
log.push('P7 types x' + typN);
let locN = 0;
html = html.replace(/(<div class="ProjectItem-module__zYQwxW__location"[^>]*>)[^<]*(<\/div>)/g, (m, a, b) => { locN++; return a + 'Addis Ababa, Ethiopia' + b; });
log.push('P7 locations x' + locN);

// ============================ P8 — process section ============================
rep('>NUESTRO<', '>FROM EMPTY<', 'P8 proc title A');
rep('>PROCESO<', '>ROOM TO DAILY CRATES<', 'P8 proc title B');
rep('>DISEÑO<', '>DIAGNOSTICS<', 'P8 step 1a');
rep('>INTERIORISMO<', '>INFRASTRUCTURE<', 'P8 step 2a');
rep('>RENDERIZADO<', '>FIELD TRAINING<', 'P8 step 3a');
rep('>DEFINICIÓN<', '>LAUNCH<', 'P8 step 4a');
repOrdered(/>ARQUITECTÓNICO</g, (m, i) => ['>SPACE & CLIMATE<', '>CAGE FABRICATION<', '>HANDS-ON<'][i % 3], 'P8 step arch x3');
rep('>TÉCNICA<', '>EGG OFFTAKE<', 'P8 step4b');
repT('Aterriza el diseño en productos reales, marcas, referencias y fichas técnicas coherentes con el concepto aprobado.', 'We evaluate your room, select the breed (Bovans Brown, Lohmann, or Sasso), build your 4-tier unit, train your hands, and connect the egg offtake — one pathway, end to end.', 'P8 step desc');
// process image alts
repOrdered(/alt="Paso 0\d:[^"]*"/g, (m, i) => 'alt="Step 0' + (i + 1) + ': ' + ['Room + breed diagnostics', 'Cage fabrication', 'Hands-on apprenticeship', 'Placement + offtake'][Math.min(i, 3)] + '"', 'P8 step alts');

// ============================ P9 — press -> stories ============================
rep('>PRENSA<', '>STORIES<', 'P9 press title');
repT('Explora todos los artículos', 'See all stories', 'P9 press cta');
repT('Lee el artículo completo', 'Read the story', 'P9 press read');
repT('REVISTA', 'FRESH', 'P9 press mag A');
repT('SIGNATURE', 'NOTES', 'P9 press mag B');
repT('TARQ Studio: Del oficio artesanal a la arquitectura internacional', 'From one batch to 91% peak laying: the Bishoftu story', 'P9 press lead');
repT('Digital Edition', 'Verified producer', 'P9 press tag digital');
repT('Septiembre, 2026', 'Bishoftu / Debre Zeit', 'P9 press tag sep');
repT('MÉXICO', 'ADDIS ABABA', 'P9 press mx');
repT('LATINOAMÉRICA', 'ETHIOPIA', 'P9 press la');
repT('Mayo, 2026', '400 layers', 'P9 press mayo');
repT('PREMIO', 'FRESH', 'P9 press premio');
repT('EXTRAORDINARIO', 'DAILY', 'P9 press extra');
repT('ÁNGELES', 'ADDIS', 'P9 press angeles');
repT('BARBERÍA', 'CHICKEN', 'P9 press barberia');
repT('CASA', 'AT', 'P9 press casa');
repT('DECOR', 'BOLE', 'P9 press decor');
repT('Casa Decor 2026 x Dos Latitudes', 'Dawit Mengistu — 91% peak laying', 'P9 press casadecor text');
repT('Awards & Distinctions', 'Flock: 400 layers, 4-tier unit', 'P9 press awards');
// press excerpts (inert spans, but content must still be on-brand)
let exiI = 0;
function exi() { return Math.min(exiI++, 1); }
repOrdered(/(<(?:span|div|p) class="Press-module__[\w-]+__excerpt[^"]*"[^>]*>)[\s\S]*?(<\/(?:span|div|p)>)/g, (m, i, a, b) => a + ['Before the training, we lost over 15% of chicks to temperature swings and water vaccine errors. After adopting their brooding checklist and installing a 4-tier cage unit, mortality dropped to 2% — and we collect 11 crates of clean eggs every single morning.', '400 layers on a 4-tier unit with a 91% peak laying rate — verified producer in the Addis network.'][exi()] + b, 'P9 press excerpts');
// press + hero long alt copies
repRe(/alt="[^"]*Dos Latitudes[^"]*"/g, () => 'alt="Dawit Mengistu — 91% peak laying"', 'P9 press alt sweep');
repRe(/alt="TARQ Studio: Del oficio artesanal[^"]*"/g, () => 'alt="From one farm to Addis tables"', 'P9 press title alts');
// press outbound links -> brand socials
repRe(/href="https:\/\/revistasignature\.pe[^"]*"/g, () => 'href="https://www.instagram.com/addis_chicken/"', 'P9 signature link');
repRe(/href="https:\/\/www\.instagram\.com\/p\/[^"]*"/g, () => 'href="https://www.instagram.com/addis_chicken/"', 'P9 ig post links');


// press sideAfter zones (secondary card text layers, pre-hover content)
const ZONES = ['sideAfterTitle', 'sideAfterDescription', 'sideAfterPublisher', 'sideAfterDate', 'sideAfterLink'];
const ZCOPY = ['Dawit Mengistu, Bishoftu', 'Before the training, we lost over 15% of chicks. After adopting their brooding checklist and installing a 4-tier cage unit, mortality dropped to 2% — and we collect 11 crates of clean eggs every single morning.', 'Dawit Mengistu', '400 layers', 'Read the story'];
ZONES.forEach((z, k) => {
  repOrdered(new RegExp('(<(?:span|div|p)[^>]*class="Press-module__x93a8W__' + z + '"[^>]*>)[\s\S]*?(<\/(?:span|div|p)>)', 'g'), (m, i, a, b) => a + ZCOPY[k] + b, 'P9 zone ' + z);
});
// curly-quoted Dos Latitudes title anywhere left (decorative)
repRe(/>\s*\.\.\.En pleno corazón de Madrid[\s\S]*?Casa Decor 2026\.\.\.</g, () => '>11 crates of clean eggs, every morning.<', 'P9 curly doslatitudes span');
// the big sideAfterTitle card bodies might also exist without the lead excerpt: sweep leftover long-copy paragraphs (Spanish)
repRe(/(<p class="Press-module__x93a8W__[^"]*"[^>]*>)[^<]{60,}(<\/p>)/g, (m, a, b) => a + '400 layers on a 4-tier unit with a 91% peak laying rate — verified producer in the Addis network.' + b, 'P9 press paragraph sweep');

// ============================ P10 — footer ============================
repT('Arquitectura que piensa,', 'Profitable farms aren\'t luck.', 'P10 footer title A');
repT('cuestiona y propone.', 'They are protocol.', 'P10 footer title B');
repT('Ponte en contacto', 'Enroll or ask anything', 'P10 footer contact');
repT('Enviar', 'Send', 'P10 footer send');
repT('Compañía', 'The Brand', 'P10 footer col brand');
repT('Social', 'Channels', 'P10 footer col social');
rep('https://www.instagram.com/studiotarq/?hl=es', 'https://t.me/mychickenaddis', 'P10 footer ig link');
rep('https://www.linkedin.com/company/tarqstudio/?originalSubdomain=co', 'mailto:info@mychickenaddis.com', 'P10 footer li link');
repT('LinkedIn', 'Email', 'P10 footer li label');
repT('© TARQ Studio, All rights reserved, 2026', '© My Chicken Addis. All rights reserved.', 'P10 footer copyright');
repT('@ Nea Studio', 'Addis Ababa', 'P10 footer credit');
rep('https://neastudio.xyz', '#footer', 'P10 nea href');
// the footer intro line (long text above contact)
repT('Por estos motivos y por ser un espacio que conjuga el diseño', 'Because when the farm owns the protocol, the cage, and the feed —', 'P10 footer intro A');
// the ES/EN language toggle: normalize ES link -> dead span, keep EN anchor harmless
let langToggle = 0;
html = html.replace(/<a class="(Navbar-module__[^"]*__langLink[^"]*)"[^>]*>(ES|EN)<\/a>/g, (m, cls, v) => { langToggle++; return v === 'EN' ? m : '<span class="' + cls + '">EN</span>'; });
log.push('P10 locale toggle processed x' + langToggle);
html = html.replace(/<span class="(Navbar-module__[^"]*__langSep[^"]*)"[^>]*>\s*\/\s*<\/span>/g, '');
log.push('P10 locale separators stripped');

// ============================ P11 — images -> local assets ============
const IMG = {
  casaDecor1: 'assets/careerBox.jpg', casaDecor3: 'assets/explore5.jpg',
  studioMob: 'assets/discover1.jpg', studioDesk: 'assets/discover1.jpg',
  puntaA: 'assets/social5.jpg', puntaL: 'assets/talents2.jpg',
  salas1: 'assets/explore1.jpg', salasH: 'assets/discover2.jpg',
  iriT: 'assets/explore2.jpg', iriC: 'assets/person2.jpg',
  mak1: 'assets/explore4.jpg', mak2: 'assets/social1.jpg',
  nj1: 'assets/explore3.jpg', nj2: 'assets/talents3.jpg',
  pr1: 'assets/careerImg3.jpg', pr2: 'assets/careerImg1.jpg', pr3: 'assets/talents1.jpg', pr4: 'assets/discover2.jpg',
};
const IMGREPS = [
  ['01_TARQ_CasaDecor.avif', IMG.casaDecor1, 'P11 hero/card1'],
  ['03_TARQ_CasaDecor.avif', IMG.casaDecor3, 'P11 card1 hover'],
  ['studio-home-mobile.avif', IMG.studioMob, 'P11 studio mobile'],
  ['studio-home.avif', IMG.studioDesk, 'P11 studio desktop'],
  ['PuntaMar_Aerea.avif', IMG.puntaA, 'P11 card2 main'],
  ['PuntaMar_Lobby.avif', IMG.puntaL, 'P11 card2 hover'],
  ['06_VINOTECAINTSALESAS.avif', IMG.salas1, 'P11 card3 main'],
  ['09_SALAFcover.avif', IMG.salasH, 'P11 card3 hover'],
  ['Irimaka_Total_Horizontal.avif', IMG.iriT, 'P11 card4 main'],
  ['Irimaka_corte.avif', IMG.iriC, 'P11 card4 hover'],
  ['241A9246maka.avif', IMG.mak1, 'P11 card5 a'],
  ['241A9424-1.avif', IMG.mak2, 'P11 card5 b'],
  ['06_COMEDORnj.avif', IMG.nj1, 'P11 card6 main'],
  ['08_COCINANJ.avif', IMG.nj2, 'P11 card6 hover'],
  ['process%2F01.avif', IMG.pr1, 'P11 process 1'],
  ['process%2F02.avif', IMG.pr2, 'P11 process 2'],
  ['process%2F03.avif', IMG.pr3, 'P11 process 3'],
  ['process%2F04.avif', IMG.pr4, 'P11 process 4'],
];
IMGREPS.forEach(([token, file, name]) => {
  const rx = new RegExp("/_next/image\\?url=[^\"\\s>]*" + esc(token) + "[^\"\\s>]*", 'g');
  repRe(rx, () => file, name);
});
// hero inline bg (direct /api/media ref, not /_next/image proxy)
repRe(/background-image:\s*url\((?:&quot;|["'])?\/api\/media\/file\/01_TARQ_CasaDecor\.avif(?:&quot;|["'])?\)/g, () => "background-image: url('assets/careerBox.jpg')", 'P11 hero bg inline');
// catch-all: every remaining /_next/image URL (extension-less names too)
const PRESS_POOL = ['assets/social1.jpg', 'assets/social4.jpg', 'assets/scienceBig.jpg', 'assets/social2.jpg', 'assets/talents2.jpg', 'assets/info.jpg', 'assets/modal.jpg', 'assets/coursesBg.jpg'];
repOrdered(/\/_next\/image\?url=[^"'\s>]+/g, (m, i) => PRESS_POOL[i % PRESS_POOL.length], 'P11 catch-all image sweep');
// any direct /api/media refs left
repOrdered(/\/api\/media\/file\/[^"'\s>]+/g, (m, i) => PRESS_POOL[(i + 3) % PRESS_POOL.length], 'P11 /api/media leftovers');

// ============================ P12 — runtime ============
const RUNTIME = `
(function () {
  'use strict';
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a) return;
    var id = a.getAttribute('href');
    if (!id || id.length < 2) return;
    var t = document.querySelector(id);
    if (!t) return;
    e.preventDefault();
    try { window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY, behavior: 'smooth' }); } catch (err) { window.scrollTo(0, t.offsetTop); }
    if (history.replaceState) history.replaceState(null, '', id);
  });
  // hero: next-item cycling (React gone, vanilla drives it)
  var slides = [
    { tag: 'Next batch: open', title: 'Weekend Intensive', img: 'assets/careerBox.jpg' },
    { tag: '4 weeks', title: 'Commercial Masterclass', img: 'assets/social5.jpg' },
    { tag: 'Turnkey', title: '4-Tier Cage Setup', img: 'assets/explore3.jpg' },
  ];
  var idx = 0;
  var cur = document.querySelector('.hero-bg-current');
  var title = document.querySelector('.hero-title');
  var tag = document.querySelector('.hero-year');
  document.querySelectorAll('.hero-next-project').forEach(function (btn) {
    btn.addEventListener('click', function () {
      idx = (idx + 1) % slides.length;
      var s = slides[idx];
      if (title) title.textContent = s.title;
      if (tag) tag.textContent = s.tag;
      if (cur) cur.style.backgroundImage = 'linear-gradient(0deg, rgba(0,0,0,.25), rgba(0,0,0,.25)), url("' + s.img + '")';
    });
  });
  // mobile menu overlay
  var burger = document.querySelector('nav button[aria-label*="en"]') || document.querySelector('.Navbar-module__cJzEcG__hamburger') || document.querySelector('.Navbar-module__cJzEcG__menuButton');
  var overlay = document.getElementById('mobile-menu-overlay');
  if (burger && overlay) {
    burger.addEventListener('click', function () {
      var open = overlay.getAttribute('aria-hidden') === 'false';
      if (open) { overlay.setAttribute('aria-hidden', 'true'); overlay.setAttribute('inert', ''); document.body.style.overflow = ''; }
      else { overlay.setAttribute('aria-hidden', 'false'); overlay.removeAttribute('inert'); document.body.style.overflow = 'hidden'; }
    });
    overlay.querySelectorAll('a').forEach(function (l) { l.addEventListener('click', function () { overlay.setAttribute('aria-hidden', 'true'); overlay.setAttribute('inert', ''); document.body.style.overflow = ''; }); });
  }
})();
`;
html = html.replace(/<\/body>/, () => '\n  <script>' + RUNTIME + '\n  </script>\n</body>');

// ============================ assertions + write ============
const mustZero = [/TARQ/i, /tarqstudio/i, /Casa Decor/i, /Punta Mar/i, /Salesas/i, /Irimaka/i, /Makaira/i, /Casa NJ/i, /Bogot\u00e1/i, /Miami/i, /Interiorismo/i, /Nosotros/, /Proyectos/, /metricool/i, /_next\//, /neastudio/i, /awwwards/i, /Dos Latitudes/i, /PREMIO/, /EXTRAORDINARIO/, /\u00c1NGELES/, /BARBER\u00cdA/, /M\u00c9XICO/, /LATINOAM\u00c9RICA/, /DISE\u00d1O/, /INTERIORISMO\b/, /Arquitectura e interiorismo/, /Crispy/, /Bole outlet/, /Bole, Addis/, /Order Fresh/, /SW Poultry/, /FW Agro/, /FARM TO TABLE/, /boiler/i, /fillet/i, /Addis Chicken/, /Good chicken/, /vertically integrated/i, /Order or ask anything/];
const bad = [];
mustZero.forEach(rx => { const m = html.match(rx); if (m) { const at = html.indexOf(m[0]); bad.push(rx.source + ' :: ' + JSON.stringify(html.slice(Math.max(0, at - 60), at + 90))); } });
if (bad.length) { log.push('ASSERT FAIL x' + bad.length); bad.forEach(b => log.push('  LEFTOVER!! ' + b)); }
else log.push('ASSERT: zero template leftovers');
const mustHave = ['My Chicken Addis', 'Modern & Profitable Poultry Farming', 'Weekend Intensive', 'Commercial Masterclass', '4-Tier Cage', 'Feed Formulation', 'FROM EMPTY', 'ROOM TO DAILY CRATES', 'DIAGNOSTICS', 'INFRASTRUCTURE', 'FIELD TRAINING', 'Bovans Brown', 'Dawit Mengistu', '91% peak laying', '11 crates', 'Megenagna', 'Next batch: open', 'Enroll Now', 'LAUNCH', 't.me/mychickenaddis', 'info@mychickenaddis.com', 'assets/careerBox.jpg', 'assets/discover1.jpg', 'data:font/ttf;base64', 'data:font/otf;base64'];
const missing = mustHave.filter(x => !html.includes(x));
if (missing.length) missing.forEach(x => log.push('MISSING marker: ' + x));
log.push('MARKERS: ' + (mustHave.length - missing.length) + '/' + mustHave.length);
log.push('COUNTS ' + JSON.stringify({ sections: (html.match(/<section/g) || []).length, imgs: (html.match(/<img/g) || []).length, scripts: (html.match(/<script/g) || []).length, styles: (html.match(/<style/g) || []).length, docs: (html.match(/<\/html>/g) || []).length }));
fs.writeFileSync(OUT + 'index.pretty.html', html);
log.push('WROTE ' + OUT + 'index.pretty.html (' + html.length + ' bytes)');
console.log(log.join('\n'));
