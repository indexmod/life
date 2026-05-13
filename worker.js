// =========================================================
// LIFE — semantic entity runtime
// =========================================================

// =========================================================
// HELPERS
// =========================================================
const SITE = 'https://life.indexmod.press';
const CANONICAL = 'https://indexmod.press';

// =========================================================
// HTML
// =========================================================
function page({ title = 'LIFE', meta = '', body = '' }) {
  return new Response(`
<!doctype html>
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

  max-width: 980px;
  margin: 0 auto;

  padding: 80px 32px;

  line-height: 1.7;
  font-size: 20px;
}

a {
  color: blue;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

h1 {
  font-size: 54px;
  font-weight: normal;
  line-height: 1.1;
  margin: 0 0 30px;
}

h2 {
  font-size: 24px;
  font-weight: normal;
  margin-top: 50px;
}

pre {
  white-space: pre-wrap;
}

.label {
  font-size: 12px;
  text-transform: uppercase;
  opacity: .4;
  letter-spacing: .08em;
}

.entity {
  padding-bottom: 80px;
}

.grid {
  display: grid;
  gap: 18px;
}

.card {
  border-bottom: 1px solid #ddd;
  padding-bottom: 18px;
}

.meta {
  opacity: .6;
  font-size: 14px;
}

.hero {
  width: 100%;
  max-width: 900px;
  display: block;
  margin: 30px 0;
}

</style>

</head>

<body>

${body}

</body>
</html>
`, {
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
  const obj = await env.PAGES.get(file(slug));
  return obj ? await obj.text() : null;
}

async function listFiles(env) {
  const res = await env.PAGES.list();

  return res.objects
    .filter(o => o.key.endsWith('.md'))
    .map(o => o.key.replace('.md', ''));
}

// =========================================================
// PARSER
// =========================================================
function parse(md = '') {

  const m = md.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

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

    const key = line.slice(0, i).trim();
    const value = line.slice(i + 1).trim();

    meta[key] = value;
  });

  return {
    meta,
    content: m[2]
  };
}

// =========================================================
// SUMMARY
// =========================================================
function summary(content = '') {
  return content
    .replace(/\[\[(.*?)\]\]/g, '')
    .replace(/!\[.*?\]\((.*?)\)/g, '')
    .replace(/[#>*_\-\n]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 220);
}

// =========================================================
// IMAGE EXTRACTION
// =========================================================
function image(content = '') {

  const md =
    content.match(/!\[.*?\]\((.*?)\)/);

  if (md) return md[1];

  const raw =
    content.match(/https?:\/\/\S+\.(jpg|jpeg|png|webp|gif)/i);

  if (raw) return raw[0];

  return `${SITE}/default-og.jpg`;
}

// =========================================================
// LINKS
// =========================================================
function extractLinks(content = '') {
  const matches =
    [...content.matchAll(/\[\[(.*?)\]\]/g)];

  return matches.map(m =>
    m[1].trim().toLowerCase()
  );
}

// =========================================================
// ENTITY
// =========================================================
function generateEntity(slug, parsed) {

  const linksTo =
    extractLinks(parsed.content);

  const desc =
    summary(parsed.content);

  return {

    id: slug,

    title:
      parsed.meta.title ||
      slug,

    type:
      parsed.meta.type ||
      'entity',

    energy:
      parsed.meta.energy ||
      'unknown',

    temperament:
      parsed.meta.temperament ||
      'neutral',

    summary: desc,

    image:
      parsed.meta.image ||
      image(parsed.content),

    linksTo,

    linkedFrom: [],

    updated:
      new Date().toISOString(),

    canonical:
      `${CANONICAL}/${slug}`,

    life:
      `${SITE}/entity/${slug}`
  };
}

// =========================================================
// GRAPH
// =========================================================
async function buildGraph(env) {

  const slugs =
    await listFiles(env);

  const entities = [];
  const graph = {};
  const backlinks = {};

  for (const slug of slugs) {

    const md =
      await getFile(env, slug);

    if (!md) continue;

    const parsed =
      parse(md);

    const entity =
      generateEntity(slug, parsed);

    entities.push(entity);

    graph[slug] =
      entity.linksTo;
  }

  entities.forEach(entity => {

    entity.linksTo.forEach(target => {

      if (!backlinks[target]) {
        backlinks[target] = [];
      }

      backlinks[target]
        .push(entity.id);
    });
  });

  entities.forEach(entity => {

    entity.linkedFrom =
      backlinks[entity.id] || [];

    entity.rank =
      entity.linkedFrom.length * 2 +
      entity.linksTo.length;
  });

  return {
    entities,
    graph,
    backlinks
  };
}

// =========================================================
// META
// =========================================================
function meta(entity) {

  return `

<title>${entity.title} — LIFE</title>

<meta name="description"
content="${entity.summary}">

<link rel="canonical"
href="${entity.canonical}">

<meta name="robots"
content="index,follow,max-image-preview:large">

<meta property="og:type"
content="article">

<meta property="og:site_name"
content="LIFE">

<meta property="og:title"
content="${entity.title}">

<meta property="og:description"
content="${entity.summary}">

<meta property="og:url"
content="${entity.life}">

<meta property="og:image"
content="${entity.image}">

<meta property="og:image:width"
content="1200">

<meta property="og:image:height"
content="630">

<meta name="twitter:card"
content="summary_large_image">

<meta name="twitter:title"
content="${entity.title}">

<meta name="twitter:description"
content="${entity.summary}">

<meta name="twitter:image"
content="${entity.image}">

<meta name="entity-rank"
content="${entity.rank}">

<script type="application/ld+json">
${JSON.stringify(jsonld(entity), null, 2)}
</script>

`;
}

// =========================================================
// JSONLD
// =========================================================
function schemaType(type) {

  if (type === 'person')
    return 'Person';

  if (type === 'technology')
    return 'TechArticle';

  if (type === 'place')
    return 'Place';

  return 'Thing';
}

function jsonld(entity) {

  return {
    '@context': 'https://schema.org',

    '@type':
      schemaType(entity.type),

    name:
      entity.title,

    description:
      entity.summary,

    image:
      entity.image,

    url:
      entity.life,

    mainEntityOfPage:
      entity.canonical,

    keywords:
      entity.linksTo.join(', ')
  };
}

// =========================================================
// ENTITY PAGE
// =========================================================
function renderEntity(entity) {

  return page({

    meta: meta(entity),

    body: `

<div class="entity">

<div class="label">
semantic entity
</div>

<h1>
${entity.title}
</h1>

<p class="meta">
${entity.type}
·
rank ${entity.rank}
</p>

<img
class="hero"
src="${entity.image}">

<p>
${entity.summary}
</p>

<h2>
related entities
</h2>

<div class="grid">

${entity.linksTo.map(link => `
<div class="card">
<a href="/entity/${link}">
${link}
</a>
</div>
`).join('')}

</div>

<h2>
backlinks
</h2>

<div class="grid">

${entity.linkedFrom.map(link => `
<div class="card">
<a href="/entity/${link}">
${link}
</a>
</div>
`).join('')}

</div>

<h2>
canonical
</h2>

<p>
<a href="${entity.canonical}">
${entity.canonical}
</a>
</p>

</div>

`
  });
}

// =========================================================
// HOME
// =========================================================
function renderHome(entities) {

  return page({

    body: `

<h1>
LIFE
</h1>

<p>
semantic entity runtime
</p>

<div class="grid">

${entities.map(entity => `

<div class="card">

<a href="/entity/${entity.id}">
${entity.title}
</a>

<div class="meta">
${entity.summary}
</div>

</div>

`).join('')}

</div>

`
  });
}

// =========================================================
// FEED
// =========================================================
function renderFeed(entities) {

  const lines = entities.map(entity =>
    JSON.stringify({

      entity:
        entity.id,

      title:
        entity.title,

      summary:
        entity.summary,

      image:
        entity.image,

      rank:
        entity.rank,

      event:
        'observed',

      time:
        entity.updated
    })
  );

  return new Response(
    lines.join('\n'),
    {
      headers: {
        'Content-Type':
          'application/x-ndjson'
      }
    }
  );
}

// =========================================================
// SITEMAP
// =========================================================
function renderSitemap(entities) {

  const urls =
    entities.map(entity => `

<url>

<loc>
${SITE}/entity/${entity.id}
</loc>

<lastmod>
${entity.updated}
</lastmod>

<changefreq>
weekly
</changefreq>

<priority>
0.8
</priority>

</url>

`).join('');

  return new Response(`

<?xml version="1.0" encoding="UTF-8"?>

<urlset
xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

${urls}

</urlset>

`, {
    headers: {
      'Content-Type':
        'application/xml'
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

Sitemap: ${SITE}/sitemap.xml

`, {
    headers: {
      'Content-Type':
        'text/plain'
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

      const runtime =
        await buildGraph(env);

      // HOME
      if (p === '/') {
        return renderHome(runtime.entities);
      }

      // GRAPH
      if (p === '/graph') {
        return Response.json(runtime.graph);
      }

      // BACKLINKS
      if (p === '/backlinks') {
        return Response.json(runtime.backlinks);
      }

      // FEED
      if (p === '/feed') {
        return renderFeed(runtime.entities);
      }

      // SITEMAP
      if (p === '/sitemap.xml') {
        return renderSitemap(runtime.entities);
      }

      // ROBOTS
      if (p === '/robots.txt') {
        return robots();
      }

      // ENTITY
      if (p.startsWith('/entity/')) {

        const id =
          p.split('/').pop();

        const entity =
          runtime.entities.find(
            e => e.id === id
          );

        if (!entity) {

          return new Response(
            'entity not found',
            { status: 404 }
          );
        }

        return renderEntity(entity);
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
