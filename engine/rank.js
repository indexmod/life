export function rank(entity) {
  let score = 0;

  if (entity.summary) score += 1;
  if (entity.image) score += 1;
  if (entity.linksTo?.length) score += entity.linksTo.length * 0.5;

  return score;
}
