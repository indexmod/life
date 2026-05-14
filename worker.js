// =========================================================
// LIFE — LIGHT SEMANTIC INDEX RUNTIME
// =========================================================

const SITE = 'https://life.indexmod.press';
const CANONICAL = 'https://indexmod.press';

// =========================================================
// INDEX LOADER (FAST + FALLBACK)
// =========================================================
async function loadIndex(env) {
  const obj = await env.PAGES.get('_system/index.json');

  if (obj) {
    try {
      return JSON.parse(await obj.text());
    } catch (e) {
      return [];
    }
  }

  return [];
}

// fallback builder (если index пуст)
async function buildIndexFallback(env) {
  const res = await env.PAGES.list();

  const mdFiles = res.objects
    .filter(o => o.key.endsWith('.md'))
    .map(o => o.key.replace('.md', ''));

  const index = [];

  for (const slug of mdFiles) {
    const obj = await env.PAGES.get(`${slug}.md`);
    if (!obj) continue;

    const md = await obj.text();
    const parsed = parse(md);

    index.push({
      id: slug,
      title: parsed.meta.title || slug,
      summary: summary(parsed.content),
      image: image(parsed.content)
    });
  }

  return index;
}

// =========================================================
// MD PARSER (MINIMAL)
// =========================================================
function parse(md = '') {
  const m = md.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

  if (!m) return { meta: {}, content: md };

  const meta = {};
  m[1].split('\n').forEach(l => {
    const i = l.indexOf(':');
    if (i === -1) return;
    meta[l.slice(0, i).trim()] = l.slice(i + 1).trim();
  });

  return { meta, content: m[2] };
}

// =========================================================
// SUMMARY
// =========================================================
function summary(t = '') {
  return t
    .replace(/\[\[(.*?)\]\]/g, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/[#>*_\-\n]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 180);
}

// =========================================================
// IMAGE
// =========================================================
function image(content = '') {
  const md = content.match(/!\[.*?\]\((.*?)\)/);
  if (md) return md[1];
  return `${SITE}/default-og.jpg`;
}

// =========================================================
// META (OG FIXED FOR SCRAPERS)
// =========================================================
function meta(entity) {
  const desc = entity.summary || '';

  return `
<title>${entity.title} — Life</title>

<meta name="description" content="${desc}">
<link rel="canonical" href="${entity.url}">

<meta name="robots" content="index,follow,max-image-preview:large">

<meta property="og:type" content="article">
<meta property="og:site_name" content="Life">
<meta property="og:title" content="${entity.title}">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="${entity.url}">
<meta property="og:image" content="${entity.image}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${entity.title}">
<meta name="twitter:description" content="${desc}">
<meta name="twitter:image" content="${entity.image}">
`;
}

// =========================================================
// HTML WRAPPER
// =========================================================
function page(meta, body) {
  return new Response(`
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
${meta}
<style>
body{
  font-family: Georgia, serif;
  max-width: 900px;
  margin:0 auto;
  padding:60px 20px;
  font-size:18px;
  line-height:1.6;
}
.grid{
  display:grid;
  gap:6px;
}
.card{
  padding:4px 0;
}
a{color:blue;text-decoration:none}
a:hover{text-decoration:underline}
img{max-width:100%;margin:20px 0}
</style>
</head>
<body>
${body}
</body>
</html>
`, {
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });
}

// =========================================================
// ENTITY PAGE (FAST + CLEAN)
// =========================================================
async function renderEntity(env, id, index) {

  const item = index.find(i => i.id === id);

  if (!item) {
    return new Response("not found", { status: 404 });
  }

  const url = `${SITE}/entity/${id}`;

  return page(meta({
    title: item.title,
    summary: item.summary,
    image: item.image,
    url
  }), `
<h1>${item.title}</h1>

<img src="${item.image}">

<p>${item.summary}</p>

<p><a href="${CANONICAL}/${id}">canonical</a></p>
`);
}

// =========================================================
// HOME (MINIMAL GRID — NO RANKS, NO GRAPH)
// =========================================================
function renderHome(index) {
  return page("", `
<h1>Life</h1>

<div class="grid">
${index.map(i => `
<div class="card">
<a href="/entity/${i.id}">${i.title}</a>
</div>
`).join('')}
</div>
`);
}

// =========================================================
// SITEMAP (GOOGLE READY)
// =========================================================
function sitemap(index) {
  const urls = index.map(i => `
<url>
<loc>${SITE}/entity/${i.id}</loc>
</url>
`).join('');

  return new Response(`<?xml version="1.0"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`, {
    headers: { "Content-Type": "application/xml" }
  });
}

// =========================================================
// ROBOTS
// =========================================================
function robots() {
  return new Response(`
User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
`, {
    headers: { "Content-Type": "text/plain" }
  });
}

// =========================================================
// ROUTER
// =========================================================
export default {
  async fetch(req, env) {

    const url = new URL(req.url);
    const p = url.pathname;

    let index = await loadIndex(env);

    // fallback if empty
    if (!index.length) {
      index = await buildIndexFallback(env);
    }

    if (p === '/') return renderHome(index);

    if (p === '/sitemap.xml') {
      return sitemap(index);
    }

    if (p === '/robots.txt') {
      return robots();
    }

    if (p.startsWith('/entity/')) {
      const id = p.split('/').pop();
      return renderEntity(env, id, index);
    }

    if (p === '/index.json') {
      return Response.json(index);
    }

    return new Response("404", { status: 404 });
  }
};
