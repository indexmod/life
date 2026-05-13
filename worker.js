// =========================================================
// LIFE — lightweight semantic index runtime
// optimized entity/meta/index worker
// =========================================================

const SITE = 'https://life.indexmod.press';
const CANONICAL = 'https://indexmod.press';

// =========================================================
// HTML
// =========================================================
function page({ title = 'LIFE', meta = '', body = '' }) {

  return new Response(`<!doctype html>
<html>
<head>

<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">

${meta}

<style>

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
}

body {
  font-family: Georgia, serif;
  background: #fff;
  color: #000;

  padding: 40px 24px;
}

a {
  color: #000;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

h1 {
  font-size: 34px;
  font-weight: normal;
  margin: 0 0 30px;
}

img {
  max-width: 100%;
  display: block;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill,minmax(180px,1fr));
  gap: 10px;
}

.card {
  border: 1px solid #eee;
  padding: 10px;
  overflow: hidden;
}

.card img {
  aspect-ratio: 1.91/1;
  object-fit: cover;
  margin-bottom: 8px;
}

.title {
  font-size: 15px;
  line-height: 1.25;
}

.meta {
  opacity: .5;
  font-size: 11px;
  margin-top: 4px;
}

.hero {
  width: 100%;
  aspect-ratio: 1.91/1;
  object-fit: cover;
  margin: 24px 0;
}

.links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 20px;
}

.links a {
  border: 1px solid #ddd;
  padding: 4px 8px;
  font-size: 12px;
}

</style>

</head>

<body>

${body}

</body>
</html>`, {

    headers: {
      'Content-Type': 'text/html; charset=utf-8'
    }

  });
}

// =========================================================
// STORAGE
// =========================================================
const file = slug => `${slug}.md`;

async function getFile(env, slug) {

  const obj =
    await env.PAGES.get(file(slug));

  return obj
    ? await obj.text()
    : null;
}

async function listFiles(env) {

  const res =
    await env.PAGES.list();

  return res.objects
    .filter(o => o.key.endsWith('.md'))
    .map(o => o.key.replace('.md', ''));
}

// =========================================================
// PARSER
// =========================================================
function parse(md = '') {

  const m =
    md.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

  if (!m) {

    return {
      meta: {},
      content: md
    };
  }

  const meta = {};

  m[1].split('\n').forEach(line => {

    const i = line.indexOf(':');

    if (i === -1) return;

    meta[
      line.slice(0, i).trim()
    ] =
      line.slice(i + 1).trim();
  });

  return {
    meta,
    content: m[2]
  };
}

// =========================================================
// CLEAN SUMMARY
// =========================================================
function summary(content = '') {

  return content

    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[\[(.*?)\]\]/g, '$1')
    .replace(/[#>*_`-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 180);
}

// =========================================================
// IMAGE EXTRACTION
// =========================================================
function extractImage(content = '') {

  const md =
    content.match(/!\[.*?\]\((.*?)\)/);

  if (md) return md[1];

  const raw =
    content.match(/https?:\/\/\S+\.(jpg|jpeg|png|webp)/i);

  if (raw) return raw[0];

  return `${SITE}/default-og.jpg`;
}

// =========================================================
// LINKS
// =========================================================
function links(content = '') {

  return [
    ...content.matchAll(/\[\[(.*?)\]\]/g)
  ].map(m =>
    m[1]
      .trim()
      .toLowerCase()
  );
}

// =========================================================
// ENTITY
// =========================================================
function entity(slug, parsed) {

  return {

    id: slug,

    title:
      parsed.meta.title ||
      slug,

    type:
      parsed.meta.type ||
      'entity',

    summary:
      summary(parsed.content),

    image:
      parsed.meta.image ||
      extractImage(parsed.content),

    linksTo:
      links(parsed.content),

    linkedFrom: [],

    canonical:
      `${CANONICAL}/${slug}`,

    url:
      `${SITE}/entity/${slug}`,

    updated:
      new Date().toISOString()
  };
}

// =========================================================
// RUNTIME
// =========================================================
async function runtime(env) {

  const slugs =
    await listFiles(env);

  const entities = [];
  const backlinks = {};

  for (const slug of slugs) {

    const md =
      await getFile(env, slug);

    if (!md) continue;

    const parsed =
      parse(md);

    const e =
      entity(slug, parsed);

    entities.push(e);
  }

  // backlinks
  entities.forEach(e => {

    e.linksTo.forEach(target => {

      if (!backlinks[target]) {
        backlinks[target] = [];
      }

      backlinks[target].push(e.id);
    });
  });

  // rank
  entities.forEach(e => {

    e.linkedFrom =
      backlinks[e.id] || [];

    e.rank =
      e.linkedFrom.length +
      e.linksTo.length;
  });

  entities.sort((a, b) =>
    b.rank - a.rank
  );

  return entities;
}

// =========================================================
// META
// =========================================================
function meta(e) {

  return `

<title>${e.title}</title>

<meta name="description"
content="${e.summary}">

<link rel="canonical"
href="${e.canonical}">

<meta name="robots"
content="index,follow,max-image-preview:large">

<meta property="og:type"
content="article">

<meta property="og:title"
content="${e.title}">

<meta property="og:description"
content="${e.summary}">

<meta property="og:url"
content="${e.url}">

<meta property="og:image"
content="${e.image}">

<meta property="og:image:width"
content="1200">

<meta property="og:image:height"
content="630">

<meta property="og:site_name"
content="LIFE">

<meta name="twitter:card"
content="summary_large_image">

<meta name="twitter:title"
content="${e.title}">

<meta name="twitter:description"
content="${e.summary}">

<meta name="twitter:image"
content="${e.image}">

<script type="application/ld+json">
${JSON.stringify({

  '@context': 'https://schema.org',

  '@type': 'Thing',

  name: e.title,

  description: e.summary,

  image: e.image,

  url: e.url,

  sameAs: e.canonical

}, null, 2)}
</script>

`;
}

// =========================================================
// HOME
// =========================================================
function home(entities) {

  return page({

    body: `

<h1>
LIFE
</h1>

<div class="grid">

${entities.map(e => `

<a
class="card"
href="/entity/${e.id}">

<img
loading="lazy"
src="${e.image}">

<div class="title">
${e.title}
</div>

<div class="meta">
rank ${e.rank}
</div>

</a>

`).join('')}

</div>

`
  });
}

// =========================================================
// ENTITY PAGE
// =========================================================
function entityPage(e) {

  return page({

    meta: meta(e),

    body: `

<h1>
${e.title}
</h1>

<img
class="hero"
src="${e.image}">

<p>
${e.summary}
</p>

<div class="links">

${e.linksTo.map(link => `
<a href="/entity/${link}">
${link}
</a>
`).join('')}

</div>

`
  });
}

// =========================================================
// SITEMAP
// =========================================================
function sitemap(entities) {

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>

<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

${entities.map(e => `

<url>
<loc>${e.url}</loc>
<changefreq>weekly</changefreq>
<priority>0.8</priority>
</url>

`).join('')}

</urlset>`,

  {
    headers: {
      'Content-Type': 'application/xml'
    }
  });
}

// =========================================================
// ROBOTS
// =========================================================
function robots() {

  return new Response(`

User-agent: *
Allow: /

User-agent: facebookexternalhit
Allow: /

Sitemap: ${SITE}/sitemap.xml

`, {

    headers: {
      'Content-Type': 'text/plain'
    }

  });
}

// =========================================================
// ROUTER
// =========================================================
export default {

  async fetch(req, env) {

    const url =
      new URL(req.url);

    const p =
      url.pathname;

    try {

      const entities =
        await runtime(env);

      // HOME
      if (p === '/') {
        return home(entities);
      }

      // SITEMAP
      if (p === '/sitemap.xml') {
        return sitemap(entities);
      }

      // ROBOTS
      if (p === '/robots.txt') {
        return robots();
      }

      // FEED
      if (p === '/feed') {

        return Response.json(
          entities.slice(0, 100)
        );
      }

      // ENTITY
      if (p.startsWith('/entity/')) {

        const id =
          p.split('/').pop();

        const e =
          entities.find(
            x => x.id === id
          );

        if (!e) {

          return new Response(
            'not found',
            { status: 404 }
          );
        }

        return entityPage(e);
      }

      return new Response(
        '404',
        { status: 404 }
      );

    } catch (e) {

      return new Response(
        e.message,
        { status: 500 }
      );
    }
  }
};
