// =========================================================
// LIFE — ultra-light index renderer
// =========================================================

const SITE = 'https://life.indexmod.press';
const file = slug => `${slug}.md`;

// =========================================================
// HTML
// =========================================================
function page(body) {
  return new Response(`<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">

<style>

body {
  margin: 0;
  padding: 40px;
  font-family: Georgia, serif;
  background: #fff;
  color: #000;
}

h1 {
  font-size: 22px;
  font-weight: normal;
  margin-bottom: 30px;
}

/* =========================
   FLAT TOPIC GRID
   ========================= */

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 6px;
}

a {
  text-decoration: none;
  color: #000;
  font-size: 14px;
  line-height: 1.3;
}

a:hover {
  text-decoration: underline;
}

.meta {
  display: none; /* убрали всё лишнее */
}

.card {
  padding: 2px 0;
  border: none;
}

</style>

</head>

<body>

${body}

</body>
</html>`, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

// =========================================================
// STORAGE
// =========================================================
async function listFiles(env) {
  const res = await env.PAGES.list();

  return res.objects
    .filter(o => o.key.endsWith('.md'))
    .map(o => o.key.replace('.md', ''));
}

// =========================================================
// SIMPLE PARSE (ONLY TITLE)
// =========================================================
async function getTitle(env, slug) {
  const obj = await env.PAGES.get(file(slug));
  if (!obj) return slug;

  const md = await obj.text();

  const match = md.match(/title:\s*(.*)/);
  return match ? match[1].trim() : slug;
}

// =========================================================
// INDEX
// =========================================================
async function buildIndex(env) {
  const slugs = await listFiles(env);

  const items = await Promise.all(
    slugs.map(async slug => {
      const title = await getTitle(env, slug);

      return {
        slug,
        title
      };
    })
  );

  items.sort((a, b) =>
    a.title.localeCompare(b.title)
  );

  return items;
}

// =========================================================
// RENDER INDEX
// =========================================================
function renderIndex(items) {

  return page(`

<h1>LIFE</h1>

<div class="grid">

${items.map(i => `
<a href="/entity/${i.slug}">
${i.title}
</a>
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

    try {

      // ONLY INDEX MODE (FAST PATH)
      if (p === '/') {

        const items =
          await buildIndex(env);

        return renderIndex(items);
      }

      // SIMPLE ENTITY PASS-THROUGH (NO META, NO GRAPH)
      if (p.startsWith('/entity/')) {

        const slug = p.split('/').pop();
        const obj = await env.PAGES.get(file(slug));

        if (!obj) {
          return new Response('not found', { status: 404 });
        }

        const md = await obj.text();

        return new Response(md, {
          headers: {
            'Content-Type': 'text/plain'
          }
        });
      }

      return new Response('404', { status: 404 });

    } catch (e) {

      return new Response(e.message, {
        status: 500
      });
    }
  }
};
