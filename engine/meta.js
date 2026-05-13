export function buildMeta({ id, title, summary, image }) {
  const SITE = "https://life.indexmod.press";

  const url = `${SITE}/entity/${id}`;

  return {
    id,
    title,
    summary,
    image: image || `${SITE}/default-og.jpg`,
    url,

    og: {
      title,
      description: summary,
      image: image || `${SITE}/default-og.jpg`,
      url
    },

    twitter: {
      card: "summary_large_image",
      title,
      description: summary,
      image: image || `${SITE}/default-og.jpg`
    }
  };
}
