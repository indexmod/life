import { buildMeta } from "./meta.js";
import { rank } from "./rank.js";

// ------------------------------
// helpers (light parsing)
// ------------------------------
function parse(md = "") {
  const m = md.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

  if (!m) return { meta: {}, content: md };

  const meta = {};
  m[1].split("\n").forEach(line => {
    const i = line.indexOf(":");
    if (i === -1) return;
    meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  });

  return { meta, content: m[2] };
}

function summary(text = "") {
  return text
    .replace(/[#*_>\-\n\[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
}

function image(content = "") {
  const m = content.match(/!\[.*?\]\((.*?)\)/);
  return m ? m[1] : null;
}

// ------------------------------
// main compiler
// ------------------------------
export async function compile(env) {
  const res = await env.PAGES.list();

  const files = res.objects.filter(o => o.key.endsWith(".md"));

  const index = [];
  const sitemap = [];

  for (const f of files) {
    const slug = f.key.replace(".md", "");

    const obj = await env.PAGES.get(f.key);
    const md = await obj.text();

    const parsed = parse(md);

    const entity = {
      id: slug,
      title: parsed.meta.title || slug,
      summary: parsed.meta.summary || summary(parsed.content),
      image: parsed.meta.image || image(parsed.content),
      linksTo: []
    };

    const enriched = {
      ...entity,
      rank: rank(entity),
      meta: buildMeta(entity)
    };

    index.push(enriched);

    sitemap.push({
      loc: `https://life.indexmod.press/entity/${slug}`
    });
  }

  // sort (light importance)
  index.sort((a, b) => b.rank - a.rank);

  // SYSTEM OUTPUT
  await env.PAGES.put(
    "_system/index.json",
    JSON.stringify(index)
  );

  await env.PAGES.put(
    "_system/sitemap.json",
    JSON.stringify(sitemap)
  );

  return {
    ok: true,
    count: index.length
  };
}
