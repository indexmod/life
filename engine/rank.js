export function calculateRank(entity) {

  const incoming =
    entity.linkedFrom?.length || 0;

  const outgoing =
    entity.linksTo?.length || 0;

  const freshness =
    entity.updated ? 1 : 0;

  return (
    incoming * 2 +
    outgoing +
    freshness
  );
}
