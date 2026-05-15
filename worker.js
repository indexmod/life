// =========================================================
// LIFE — ARTICLE PHYSICS ENGINE
// spheres generated from article structure
// =========================================================

const SITE = 'https://life.indexmod.press';

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
      content: md,
      frontmatter: ''
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
    content: m[2],
    frontmatter: m[1]
  };
}

// =========================================================
// ANALYSIS
// =========================================================

function analyze(slug, parsed) {

  const text =
    parsed.content || '';

  const words =
    text
      .split(/\s+/)
      .filter(Boolean);

  const wordCount =
    words.length;

  const uniqueWords =
    new Set(
      words.map(w =>
        w.toLowerCase()
      )
    ).size;

  const links =
    (
      text.match(/\[\[(.*?)\]\]/g) || []
    ).length;

  const headings =
    (
      text.match(/^##/gm) || []
    ).length;

  const images =
    (
      text.match(/!\[/g) || []
    ).length;

  // =====================================================
  // VISUAL PHYSICS
  // =====================================================

  const size =
    Math.max(
      40,
      Math.min(
        220,
        wordCount / 12
      )
    );

  const hue =
    uniqueWords % 360;

  const saturation =
    40 + (links * 8);

  const lightness =
    30 + (headings * 4);

  const blur =
    Math.max(
      0,
      20 - images * 4
    );

  const glow =
    Math.min(
      80,
      links * 6
    );

  return {

    id: slug,

    title:
      parsed.meta.title ||
      slug,

    frontmatter:
      parsed.frontmatter,

    metrics: {

      wordCount,
      uniqueWords,
      links,
      headings,
      images
    },

    sphere: {

      size,

      hue,

      saturation,

      lightness,

      blur,

      glow
    }
  };
}

// =========================================================
// HTML
// =========================================================

function page(body = '') {

  return new Response(`

<!doctype html>

<html>

<head>

<meta charset="utf-8">

<meta name="viewport"
content="width=device-width,initial-scale=1">

<title>Life</title>

<style>

*{
  box-sizing:border-box;
}

html,
body{
  margin:0;
  padding:0;
  background:#000;
  color:#fff;
  overflow-x:hidden;
}

body{
  font-family:Helvetica,Arial,sans-serif;
}

/* ========================================= */
/* INDEX */
/* ========================================= */

.index{

  display:grid;

  grid-template-columns:
    repeat(auto-fill,minmax(160px,1fr));

  gap:40px;

  padding:60px;
}

.node{

  display:flex;
  flex-direction:column;
  align-items:center;

  cursor:pointer;

  text-decoration:none;

  color:white;
}

.label{

  margin-top:12px;

  font-size:12px;

  opacity:.7;

  text-align:center;
}

/* ========================================= */
/* SPHERE */
/* ========================================= */

.sphere{

  border-radius:50%;

  transition:
    transform .2s ease,
    filter .2s ease;

  animation:
    float 6s infinite ease-in-out;
}

.sphere:hover{

  transform:scale(1.08);
}

@keyframes float {

  0%{
    transform:translateY(0px);
  }

  50%{
    transform:translateY(-8px);
  }

  100%{
    transform:translateY(0px);
  }
}

/* ========================================= */
/* ENTITY */
/* ========================================= */

.entity{

  display:grid;

  grid-template-columns:
    1fr 1fr;

  min-height:100vh;
}

.visual{

  display:flex;

  align-items:center;
  justify-content:center;

  padding:60px;
}

.editor{

  padding:60px;

  border-left:
    1px solid rgba(255,255,255,.08);
}

textarea{

  width:100%;
  height:70vh;

  background:#111;
  color:#0f0;

  border:none;

  padding:20px;

  font-family:monospace;
  font-size:14px;

  resize:none;

  outline:none;
}

.stats{

  margin-top:30px;

  font-size:13px;

  opacity:.7;

  line-height:1.8;
}

button{

  margin-top:20px;

  background:#fff;
  color:#000;

  border:none;

  padding:12px 18px;

  cursor:pointer;
}

@media(max-width:900px){

  .entity{
    grid-template-columns:1fr;
  }

  .editor{
    border-left:none;
    border-top:
      1px solid rgba(255,255,255,.08);
  }
}

</style>

</head>

<body>

${body}

</body>

</html>

`, {
    headers: {
      'Content-Type':
        'text/html; charset=utf-8'
    }
  });
}

// =========================================================
// SPHERE CSS
// =========================================================

function sphereStyle(s) {

  return `

width:${s.size}px;
height:${s.size}px;

background:
radial-gradient(

circle at 30% 30%,

hsla(${s.hue},
${s.saturation}%,
${s.lightness + 25}%,
1),

hsla(${s.hue},
${s.saturation}%,
${s.lightness}%,
1)

);

filter:
blur(${s.blur}px)
drop-shadow(
0 0 ${s.glow}px
hsla(${s.hue},100%,70%,.9)
);

`;
}

// =========================================================
// HOME
// =========================================================

function renderHome(entities) {

  return page(`

<div class="index">

${entities.map(entity => `

<a
class="node"
href="/entity/${entity.id}">

<div
class="sphere"
style="${sphereStyle(entity.sphere)}">
</div>

<div class="label">
${entity.title}
</div>

</a>

`).join('')}

</div>

`);
}

// =========================================================
// ENTITY
// =========================================================

function renderEntity(entity) {

  return page(`

<div class="entity">

<div class="visual">

<div>

<div
class="sphere"
style="${sphereStyle(entity.sphere)}">
</div>

<div class="stats">

words:
${entity.metrics.wordCount}

<br>

unique:
${entity.metrics.uniqueWords}

<br>

links:
${entity.metrics.links}

<br>

headings:
${entity.metrics.headings}

<br>

images:
${entity.metrics.images}

</div>

</div>

</div>

<div class="editor">

<h1>
${entity.title}
</h1>

<textarea
id="fm">${entity.frontmatter}</textarea>

<button onclick="save()">
save frontmatter
</button>

</div>

</div>

<script>

async function save(){

  alert(
    'frontmatter editing runtime next'
  );
}

</script>

`);
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

    const slugs =
      await listFiles(env);

    const entities = [];

    for (const slug of slugs) {

      const md =
        await getFile(env, slug);

      if (!md) continue;

      const parsed =
        parse(md);

      entities.push(
        analyze(slug, parsed)
      );
    }

    // =========================================
    // HOME
    // =========================================

    if (p === '/') {

      return renderHome(entities);
    }

    // =========================================
    // ENTITY
    // =========================================

    if (p.startsWith('/entity/')) {

      const id =
        p.split('/').pop();

      const entity =
        entities.find(
          e => e.id === id
        );

      if (!entity) {

        return new Response(
          'not found',
          { status:404 }
        );
      }

      return renderEntity(entity);
    }

    // =========================================
    // JSON DEBUG
    // =========================================

    if (p === '/entities.json') {

      return Response.json(
        entities
      );
    }

    return new Response(
      '404',
      { status:404 }
    );
  }
};
