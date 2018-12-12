export default [
  { name: 'copiesNumber', type: 'number', defaultValue: 1, gte: 1, lte: { property: 'meta.osdsNumber' } },
  { name: 'minCopiesNumber', type: 'number', defaultValue: 1, gte: 1, lte: { property: 'embeddedceph.copiesNumber' } },
  { name: 'timeout', type: 'number', optional: true },
  { name: 'insecure', type: 'checkbox', optional: true, defaultValue: true },
  { name: 'readonly', type: 'checkbox', optional: true },
];
