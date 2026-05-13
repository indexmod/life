export function generateMeta(entity) {

  const title =
    entity.title || entity.id;

  const description =
    entity.description ||
    `${title} is a semantic entity inside LIFE runtime.`;

  const image =
    entity.image ||
    'https://life.indexmod.press/default-og.jpg';

  return {

    title,

    description,

    canonical:
      `https://life.indexmod.press/entity/${entity.id}`,

    og: {
      title,
      description,
      image,
      type: 'article'
    },

    twitter: {
      card: 'summary_large_image',
      title,
      description,
      image
    },

    jsonld: {
      '@context': 'https://schema.org',
      '@type': 'Thing',
      name: title,
      description,
      image,
      url:
        `https://life.indexmod.press/entity/${entity.id}`
    }
  };
}
