export default [
  { name: 'poolSize', type: 'number', defaultValue: 1, gte: 1, lte: { property: 'meta.osdsNumber' } },
  { name: 'poolMinSize', type: 'number', defaultValue: 1, gte: 1, lte: { property: 'meta.osdsNumber' } },
  { name: 'timeout', type: 'number', optional: true },
  { name: 'insecure', type: 'checkbox', optional: true, defaultValue: true },
  { name: 'readonly', type: 'checkbox', optional: true },
];
