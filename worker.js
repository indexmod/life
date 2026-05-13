// =========================================================
// LIFE — semantic entity runtime (STABLE LIGHT)
// =========================================================

const SITE = 'https://life.indexmod.press';
const CANONICAL = 'https://indexmod.press';

// =========================================================
// LOAD INDEX (FAST + SAFE + FALLBACK)
// =========================================================
async function loadIndex(env) {
  const obj = await env.PAGES.get('_system/index.json');

  if (obj) {
    try {
      return JSON.parse(await obj.text());
    } catch {}
  }

  // fallback → build from md
  return await buildFallbackIndex(env);
}

// =========================================================
// FALLBACK INDEX BUILDER (ONLY IF NO SYSTEM INDEX)
// =========================================================
async function buildFallbackIndex(env) {
  const res = await env.PAGES.list();
  const files = res.objects.filter(o => o.key.endsWith('.md'));

  const index = [];

  for (const f of files) {
    const slug = f.key.replace('.md', '');

    const obj = await env.PAGES.get(f.key);
    if (!obj) continue;

    const md = await obj.text();
    const parsed = parse(md);

    index.push({
      id: slug,
      title: parsed.meta.title || slug,
      summary: summary(parsed.content),
      image: image(parsed.content),
      url: `${SITE}/entity/${slug}`
    });
  }

  return index;
}

// =========================================================
// GET FILE
// =========================================================
const file = slug => `${slug}.md`;

async function getFile(env, slug) {
  const obj = await env.PAGES.get(file(slug));
  return obj ? await obj.text() : null;
}

// =========================================================
// PARSER (SAFE)
// =========================================================
function parse(md = '') {
  const m = md.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

  if (!m) {
    return { meta: {}, content: md };
  }

  const meta = {};

  m[1].split('\n').forEach(line => {
    const i = line.indexOf(':');
    if (i === -1) return;

    meta[line.slice(0, i).trim()] =
      line.slice(i + 1).trim();
  });

  return {
    meta,
    content: m[2]
  };
}

// =========================================================
// SUMMARY (LIGHT)
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
// IMAGE (SAFE FALLBACK)
// =========================================================
function image(content = '') {
  const md = content.match(/!\[.*?\]\((.*?)\)/);
  if (md) return md[1];

  const raw = content.match(/https?:\/\/\S+\.(jpg|jpeg|png|webp|gif)/i);
  if (raw) return raw[0];

  return `${SITE}/default-og.jpg`;
}

// =========================================================
// META TAGS
// =========================================================
function meta(entity) {
  const desc = entity.summary || '';

  return `
<title>${entity.title} — LIFE</title>

<meta name="description" content="${desc}">
<link rel="canonical" href="${entity.url}">

<meta property="og:type" content="article">
<meta property="og:site_name" content="LIFE">
<meta property="og:title" content="${entity.title}">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="${entity.url}">
<meta property="og:image" content="${entity.image}">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${entity.title}">
<meta name="twitter:description" content="${desc}">
<meta name="twitter:image" content="${entity.image}">
`;
}

// =========================================================
// PAGE WRAPPER (MINIMAL)
// =========================================================
function page(meta, body) {
  return new Response(`
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
${meta || ''}
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
  gap:8px;
}
.card{
  padding:4px 0;
}
a{color:blue;text-decoration:none}
</style>
</head>
<body>
${body}
</body>
</html>
`, {
    headers: {
      "Content-Type": "text/html; charset=utf-8"
    }
  });
}

// =========================================================
// ENTITY PAGE (FAST PATH)
// =========================================================
async function renderEntity(env, id, index) {

  const item = index.find(i => i.id === id);

  if (!item) {
    return new Response("not found", { status: 404 });
  }

  const md = await getFile(env, id);
  const parsed = parse(md);

  const entity = {
    id,
    title: item.title,
    summary: item.summary || summary(parsed.content),
    image: item.image,
    url: `${SITE}/entity/${id}`
  };

  return page(meta(entity), `
<h1>${entity.title}</h1>

<img src="${entity.image}" style="max-width:100%;margin:20px 0;">

<p>${entity.summary}</p>

<p><a href="${CANONICAL}/${id}">canonical</a></p>
`);
}

// =========================================================
// HOME (ULTRA LIGHT GRID)
// =========================================================
function renderHome(index) {
  return page("", `
<h1>LIFE</h1>

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
// ROUTER
// =========================================================
export default {
  async fetch(req, env) {

    const url = new URL(req.url);
    const p = url.pathname;

    // FAST INDEX LOAD (ONLY ONCE PER REQUEST)
    const index = await loadIndex(env);

    // HOME
    if (p === '/') {
      return renderHome(index);
    }

    // ENTITY
    if (p.startsWith('/entity/')) {
      const id = p.split('/').pop();
      return renderEntity(env, id, index);
    }

    // DEBUG INDEX
    if (p === '/index.json') {
      return Response.json(index);
    }

    return new Response('404', { status: 404 });
  }
};
