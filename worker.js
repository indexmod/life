// =========================================================
// LIFE — SEMANTIC PHYSICS RUNTIME
// future-ready structured architecture
// =========================================================



// #########################################################
// #########################################################
// CONFIG
// #########################################################
// #########################################################

const SITE =
  'https://life.indexmod.press';



// #########################################################
// #########################################################
// STORAGE LAYER
// future:
// - R2 cache
// - entity snapshots
// - semantic memory
// - graph persistence
// #########################################################
// #########################################################

const file =
  slug => `${slug}.md`;

async function getFile(env, slug) {

  const obj =
    await env.PAGES.get(
      file(slug)
    );

  return obj
    ? await obj.text()
    : null;
}

async function listFiles(env) {

  const res =
    await env.PAGES.list();

  return res.objects

    .filter(o =>
      o.key.endsWith('.md')
    )

    .map(o =>
      o.key.replace('.md', '')
    );
}



// #########################################################
// #########################################################
// PARSER LAYER
// future:
// - yaml arrays
// - nested frontmatter
// - behaviors
// - prompts
// - semantic inheritance
// #########################################################
// #########################################################

function parse(md = '') {

  const m =
    md.match(
      /^---\n([\s\S]*?)\n---\n([\s\S]*)$/
    );

  if (!m) {

    return {
      meta: {},
      content: md,
      frontmatter: ''
    };
  }

  const meta = {};

  m[1]
    .split('\n')
    .forEach(line => {

      const i =
        line.indexOf(':');

      if (i === -1)
        return;

      meta[
        line
          .slice(0, i)
          .trim()
      ] =
        line
          .slice(i + 1)
          .trim();
    });

  return {

    meta,

    content:
      m[2],

    frontmatter:
      m[1]
  };
}



// #########################################################
// #########################################################
// TEXT ANALYSIS ENGINE
// future:
// - semantic similarity
// - embeddings
// - emotional analysis
// - language detection
// - temporal decay
// - entity clustering
// #########################################################
// #########################################################

function analyzeText(text = '') {

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
      text.match(
        /\[\[(.*?)\]\]/g
      ) || []
    ).length;

  const headings =
    (
      text.match(/^##/gm)
      || []
    ).length;

  const images =
    (
      text.match(/!\[/g)
      || []
    ).length;

  const longWords =
    words.filter(
      w => w.length > 9
    ).length;

  const density =
    uniqueWords /
    Math.max(wordCount, 1);

  return {

    wordCount,

    uniqueWords,

    links,

    headings,

    images,

    longWords,

    density
  };
}



// #########################################################
// #########################################################
// VISUAL PHYSICS ENGINE
// transforms metrics → material state
//
// future:
// - particle systems
// - topology mutations
// - graph gravity
// - orbital positioning
// - reaction diffusion
// - procedural textures
// #########################################################
// #########################################################

function generateSphere(metrics = {}) {

  // =========================================
  // MASS
  // =========================================

  const size =

    Math.max(

      50,

      Math.min(
        240,
        metrics.wordCount / 10
      )
    );



  // =========================================
  // COLOR FAMILY
  // =========================================

  let group =
    'archive';

  let hue =
    180;

  // THEORY
  // dense intellectual text

  if (
    metrics.longWords > 120
  ) {

    group =
      'theory';

    hue =
      280;
  }

  // NETWORK
  // many wikilinks

  else if (
    metrics.links > 8
  ) {

    group =
      'network';

    hue =
      120;
  }

  // VISUAL
  // many images

  else if (
    metrics.images > 3
  ) {

    group =
      'visual';

    hue =
      20;
  }

  // ARCHIVE
  // low density

  else if (
    metrics.density < .32
  ) {

    group =
      'archive';

    hue =
      190;
  }

  // SIGNAL
  // high uniqueness

  else {

    group =
      'signal';

    hue =
      340;
  }



  // =========================================
  // MATERIAL
  // =========================================

  const saturation =

    30 +
    (metrics.links * 4);

  const lightness =

    26 +
    (metrics.headings * 3);

  const blur =

    Math.max(
      0,
      18 - metrics.images * 3
    );

  const glow =

    Math.min(
      90,
      metrics.uniqueWords / 10
    );



  // =========================================
  // RETURN
  // =========================================

  return {

    group,

    size,

    hue,

    saturation,

    lightness,

    blur,

    glow
  };
}



// #########################################################
// #########################################################
// ENTITY COMPILER
// future:
// - graph relations
// - semantic twins
// - entity memory
// - temporal snapshots
// #########################################################
// #########################################################

function compileEntity(
  slug,
  parsed
) {

  const metrics =
    analyzeText(
      parsed.content
    );

  const sphere =
    generateSphere(
      metrics
    );

  return {

    id:
      slug,

    title:
      parsed.meta.title
      || slug,

    frontmatter:
      parsed.frontmatter,

    metrics,

    sphere,

    group:
      sphere.group
  };
}



// #########################################################
// #########################################################
// RUNTIME BUILDER
// future:
// - incremental indexing
// - graph cache
// - entity lifecycle
// - event propagation
// #########################################################
// #########################################################

async function buildRuntime(env) {

  const slugs =
    await listFiles(env);

  const entities = [];

  for (const slug of slugs) {

    const md =
      await getFile(
        env,
        slug
      );

    if (!md)
      continue;

    const parsed =
      parse(md);

    entities.push(

      compileEntity(
        slug,
        parsed
      )
    );
  }

  return entities;
}



// #########################################################
// #########################################################
// VISUAL GROUPING
// future:
// - graph constellations
// - semantic sectors
// - dynamic clustering
// #########################################################
// #########################################################

function groupEntities(
  entities = []
) {

  return {

    theory:
      entities.filter(
        e => e.group === 'theory'
      ),

    network:
      entities.filter(
        e => e.group === 'network'
      ),

    visual:
      entities.filter(
        e => e.group === 'visual'
      ),

    archive:
      entities.filter(
        e => e.group === 'archive'
      ),

    signal:
      entities.filter(
        e => e.group === 'signal'
      )
  };
}



// #########################################################
// #########################################################
// HTML SHELL
// future:
// - theme runtime
// - projection layers
// - rendering modes
// #########################################################
// #########################################################

function page(body = '') {

  return new Response(`

<!doctype html>

<html>

<head>

<meta charset="utf-8">

<meta
name="viewport"
content="width=device-width,initial-scale=1">

<title>Life</title>

<style>



/* ##################################################### */
/* RESET */
/* ##################################################### */

*{
  box-sizing:border-box;
}

html,
body{
  margin:0;
  padding:0;
}



/* ##################################################### */
/* BODY */
/* ##################################################### */

body{

  background:#000;
  color:#fff;

  font-family:
    Helvetica,
    Arial,
    sans-serif;

  overflow-x:hidden;
}



/* ##################################################### */
/* GROUPS */
/* ##################################################### */

.section{

  padding:
    60px 50px 20px;
}

.section-title{

  font-size:11px;

  letter-spacing:.14em;

  text-transform:uppercase;

  opacity:.4;

  margin-bottom:30px;
}



/* ##################################################### */
/* GRID */
/* ##################################################### */

.index{

  display:grid;

  grid-template-columns:
    repeat(
      auto-fill,
      minmax(140px,1fr)
    );

  gap:40px;
}



/* ##################################################### */
/* NODE */
/* ##################################################### */

.node{

  display:flex;

  flex-direction:column;

  align-items:center;

  text-decoration:none;

  color:white;
}



/* ##################################################### */
/* LABEL */
/* ##################################################### */

.label{

  margin-top:14px;

  font-size:11px;

  opacity:.65;

  text-align:center;

  line-height:1.4;
}



/* ##################################################### */
/* SPHERE */
/* ##################################################### */

.sphere{

  border-radius:50%;

  animation:
    float 7s infinite ease-in-out;

  transition:
    transform .2s ease;
}

.sphere:hover{

  transform:
    scale(1.08);
}



/* ##################################################### */
/* ENTITY VIEW */
/* ##################################################### */

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
    1px solid
    rgba(255,255,255,.08);
}



/* ##################################################### */
/* TEXTAREA */
/* ##################################################### */

textarea{

  width:100%;

  height:70vh;

  background:#0b0b0b;

  color:#00ff88;

  border:none;

  padding:20px;

  font-family:monospace;

  font-size:13px;

  resize:none;

  outline:none;
}



/* ##################################################### */
/* METRICS */
/* ##################################################### */

.stats{

  margin-top:30px;

  font-size:13px;

  opacity:.65;

  line-height:1.9;
}



/* ##################################################### */
/* FLOAT */
/* ##################################################### */

@keyframes float {

  0%{
    transform:translateY(0px);
  }

  50%{
    transform:translateY(-10px);
  }

  100%{
    transform:translateY(0px);
  }
}



/* ##################################################### */
/* MOBILE */
/* ##################################################### */

@media(max-width:900px){

  .entity{

    grid-template-columns:
      1fr;
  }

  .editor{

    border-left:none;

    border-top:
      1px solid
      rgba(255,255,255,.08);
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



// #########################################################
// #########################################################
// SPHERE MATERIAL
// future:
// - animated shaders
// - procedural noise
// - texture synthesis
// #########################################################
// #########################################################

function sphereStyle(s) {

  return `

width:${s.size}px;
height:${s.size}px;

background:

radial-gradient(

circle at 30% 30%,

hsla(
${s.hue},
${s.saturation}%,
${s.lightness + 24}%,
1
),

hsla(
${s.hue},
${s.saturation}%,
${s.lightness}%,
1
)

);

filter:

blur(${s.blur}px)

drop-shadow(
0 0 ${s.glow}px
hsla(${s.hue},100%,70%,.9)
);

`;
}



// #########################################################
// #########################################################
// GROUP RENDERER
// future:
// - collapsible sectors
// - graph zoom
// - spatial navigation
// #########################################################
// #########################################################

function renderGroup(
  title,
  entities
) {

  if (!entities.length)
    return '';

  return `

<section class="section">

<div class="section-title">
${title}
</div>

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

</section>

`;
}



// #########################################################
// #########################################################
// HOME VIEW
// #########################################################
// #########################################################

function renderHome(
  entities
) {

  const groups =
    groupEntities(
      entities
    );

  return page(`

${renderGroup(
  'theory',
  groups.theory
)}

${renderGroup(
  'network',
  groups.network
)}

${renderGroup(
  'visual',
  groups.visual
)}

${renderGroup(
  'archive',
  groups.archive
)}

${renderGroup(
  'signal',
  groups.signal
)}

`);
}



// #########################################################
// #########################################################
// ENTITY VIEW
// future:
// - realtime editing
// - live sphere mutation
// - graph interaction
// #########################################################
// #########################################################

function renderEntity(
  entity
) {

  return page(`

<div class="entity">

<div class="visual">

<div>

<div
class="sphere"
style="${sphereStyle(entity.sphere)}">
</div>

<div class="stats">

group:
${entity.group}

<br>

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

<br>

density:
${entity.metrics.density.toFixed(2)}

</div>

</div>

</div>

<div class="editor">

<h1>
${entity.title}
</h1>

<textarea
id="fm">${entity.frontmatter}</textarea>

</div>

</div>

`);
}



// #########################################################
// #########################################################
// ROUTER
// future:
// - api routes
// - graph routes
// - projection routes
// #########################################################
// #########################################################

export default {

  async fetch(req, env) {

    const url =
      new URL(req.url);

    const p =
      url.pathname;



    // =========================================
    // BUILD RUNTIME
    // =========================================

    const entities =
      await buildRuntime(env);



    // =========================================
    // HOME
    // =========================================

    if (p === '/') {

      return renderHome(
        entities
      );
    }



    // =========================================
    // ENTITY
    // =========================================

    if (
      p.startsWith('/entity/')
    ) {

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

      return renderEntity(
        entity
      );
    }



    // =========================================
    // JSON DEBUG
    // =========================================

    if (
      p === '/entities.json'
    ) {

      return Response.json(
        entities
      );
    }



    // =========================================
    // 404
    // =========================================

    return new Response(
      '404',
      { status:404 }
    );
  }
};
