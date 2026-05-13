// =========================================================
// LIFE — semantic entity runtime
// =========================================================

// =========================================================
// HTML
// =========================================================
function html(content) {
  return new Response(`
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>LIFE</title>
<style>
body {
  font-family: Georgia, serif;
  max-width: 1000px;
  margin: 0 auto;
  padding: 60px 30px;
  line-height: 1.7;
  font-size: 20px;
  background: #fff;
  color: #000;
}

a {
  color: blue;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

pre {
  white-space: pre-wrap;
}

.entity {
  margin: 0 0 60px;
  padding-bottom: 40px;
  border-bottom: 1px solid #ddd;
}

.label {
  opacity: .5;
  font-size: 14px;
  text-transform: uppercase;
}
</style>
</head>
<body>
${content}
</body>
</html>
`, {
    headers: {
      "Content-Type": "text/html; charset=utf-8"
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
// LINK EXTRACTION
// =========================================================
function extractLinks(content = '') {
  const matches = [...content.matchAll(/\[\[(.*?)\]\]/g)];
  return matches.map(m => m[1].trim().toLowerCase());
}

// =========================================================
// ENTITY GENERATION
// =========================================================
function generateEntity(slug, parsed) {
  const linksTo = extractLinks(parsed.content);

  return {
    id: slug,
    title: parsed.meta.title || slug,
    type: parsed.meta.type || 'entity',

    energy: parsed.meta.energy || 'unknown',
    temperament: parsed.meta.temperament || 'neutral',

    linksTo,
    linkedFrom: [],

    updated: new Date().toISOString(),

    canonical: `https://indexmod.press/${slug}`
  };
}

// =========================================================
// GRAPH
// =========================================================
async function buildGraph(env) {
  const slugs = await listFiles(env);

  const entities = [];
  const graph = {};
  const backlinks = {};

  for (const slug of slugs) {
    const md = await getFile(env, slug);

    if (!md) continue;

    const parsed = parse(md);
    const entity = generateEntity(slug, parsed);

    entities.push(entity);

    graph[slug] = entity.linksTo;
  }

  // backlinks
  entities.forEach(entity => {
    entity.linksTo.forEach(target => {
      if (!backlinks[target]) backlinks[target] = [];
      backlinks[target].push(entity.id);
    });
  });

  entities.forEach(entity => {
    entity.linkedFrom = backlinks[entity.id] || [];
  });

  return {
    entities,
    graph,
    backlinks
  };
}

// =========================================================
// JSON-LD
// =========================================================
function jsonld(entity) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Thing',
    name: entity.title,
    identifier: entity.id,
    url: entity.canonical,
    keywords: entity.linksTo.join(', ')
  };
}

// =========================================================
// ENTITY PAGE
// =========================================================
function renderEntity(entity) {
  return html(`
<div class="entity">

<div class="label">semantic entity</div>
<h1>${entity.title}</h1>

<p>
<b>id:</b> ${entity.id}<br>
<b>type:</b> ${entity.type}<br>
<b>energy:</b> ${entity.energy}<br>
<b>temperament:</b> ${entity.temperament}
</p>

<h2>links to</h2>
<pre>${JSON.stringify(entity.linksTo, null, 2)}</pre>

<h2>linked from</h2>
<pre>${JSON.stringify(entity.linkedFrom, null, 2)}</pre>

<h2>canonical</h2>
<p>
<a href="${entity.canonical}">
${entity.canonical}
</a>
</p>

<script type="application/ld+json">
${JSON.stringify(jsonld(entity), null, 2)}
</script>

</div>
`);
}

// =========================================================
// HOME
// =========================================================
function renderHome(entities) {
  return html(`
<h1>LIFE</h1>

<p>
semantic entity runtime
</p>

${entities.map(entity => `
<p>
<a href="/entity/${entity.id}">
${entity.title}
</a>
</p>
`).join('')}
`);
}

// =========================================================
// FEED
// =========================================================
function renderFeed(entities) {
  const lines = entities.map(entity => JSON.stringify({
    entity: entity.id,
    event: 'observed',
    time: entity.updated
  }));

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'application/x-ndjson'
    }
  });
}

// =========================================================
// SITEMAP
// =========================================================
function renderSitemap(entities) {
  const urls = entities.map(entity => `
<url>
  <loc>https://life.indexmod.press/entity/${entity.id}</loc>
</url>
`).join('');

  return new Response(`
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`, {
    headers: {
      'Content-Type': 'application/xml'
    }
  });
}

// =========================================================
// ROUTER
// =========================================================
export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const p = url.pathname;

    try {

      const runtime = await buildGraph(env);

      // home
      if (p === '/') {
        return renderHome(runtime.entities);
      }

      // graph
      if (p === '/graph') {
        return Response.json(runtime.graph);
      }

      // backlinks
      if (p === '/backlinks') {
        return Response.json(runtime.backlinks);
      }

      // feed
      if (p === '/feed') {
        return renderFeed(runtime.entities);
      }

      // sitemap
      if (p === '/sitemap.xml') {
        return renderSitemap(runtime.entities);
      }

      // entity
      if (p.startsWith('/entity/')) {
        const id = p.split('/').pop();

        const entity = runtime.entities.find(e => e.id === id);

        if (!entity) {
          return new Response('entity not found', {
            status: 404
          });
        }

        return renderEntity(entity);
      }

      return new Response('404', {
        status: 404
      });

    } catch (e) {
      return new Response(e.message, {
        status: 500
      });
    }
  }
};
