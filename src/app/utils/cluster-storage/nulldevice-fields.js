export default [
  { name: 'latencyMin', type: 'number', tip: true, optional: true, gte: 0 },
  { name: 'latencyMax', type: 'number', tip: true, optional: true, gte: { property: 'nulldevice.latencyMin', number: 0 } },
  { name: 'timeoutProbability', type: 'number', tip: true, optional: true, gte: 0, lte: 1 },
  { name: 'filter', type: 'text', tip: true, optional: true },
  { name: 'timeout', type: 'number', optional: true },
  { name: 'insecure', type: 'checkbox', optional: true, defaultValue: true },
  { name: 'readonly', type: 'checkbox', optional: true , defaultValue: true },
];
