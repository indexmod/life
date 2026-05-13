import { calculateRank } from './rank.js';
import { generateMeta } from './meta.js';

// =========================================================
// PARSE
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

    const key =
      line.slice(0, i).trim();

    const value =
      line.slice(i + 1).trim();

    meta[key] = value;
  });

  return {
    meta,
    content: m[2]
  };
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
// DESCRIPTION
// =========================================================
function excerpt(content = '') {

  return content
    .replace(/\n/g, ' ')
    .replace(/\[\[(.*?)\]\]/g, '$1')
    .slice(0, 220)
    .trim();
}

// =========================================================
// COMPILE
// =========================================================
export async function compile(env) {

  const res =
    await env.PAGES.list();

  const slugs =
    res.objects
      .filter(o => o.key.endsWith('.md'))
      .map(o => o.key.replace('.md', ''));

  const entities = {};
  const graph = {};
  const backlinks = {};
  const feed = [];

  // =======================================================
  // ENTITIES
  // =======================================================
  for (const slug of slugs) {

    const obj =
      await env.PAGES.get(`${slug}.md`);

    if (!obj) continue;

    const md =
      await obj.text();

    const parsed =
      parse(md);

    const linksTo =
      extractLinks(parsed.content);

    const entity = {

      id: slug,

      title:
        parsed.meta.title || slug,

      type:
        parsed.meta.type || 'entity',

      energy:
        parsed.meta.energy || 'neutral',

      temperament:
        parsed.meta.temperament || 'neutral',

      description:
        excerpt(parsed.content),

      linksTo,

      linkedFrom: [],

      updated:
        new Date().toISOString()
    };

    entities[slug] = entity;

    graph[slug] = linksTo;
  }

  // =======================================================
  // BACKLINKS
  // =======================================================
  Object.values(entities).forEach(entity => {

    entity.linksTo.forEach(target => {

      if (!backlinks[target]) {
        backlinks[target] = [];
      }

      backlinks[target].push(entity.id);
    });
  });

  // =======================================================
  // ENRICH
  // =======================================================
  Object.values(entities).forEach(entity => {

    entity.linkedFrom =
      backlinks[entity.id] || [];

    entity.rank =
      calculateRank(entity);

    entity.meta =
      generateMeta(entity);

    feed.push({
      entity: entity.id,
      event: 'compiled',
      time: new Date().toISOString()
    });
  });

  // =======================================================
  // RETURN
  // =======================================================
  return {

    entities,

    graph,

    backlinks,

    feed:
      feed.map(e =>
        JSON.stringify(e)
      ).join('\n')
  };
}
