export default [{
  name: 'latencyMin',
  type: 'number',
  tip: true,
  optional: true,
  gte: 0,
}, {
  name: 'latencyMax',
  type: 'number',
  tip: true,
  optional: true,
  gte: {
    property: 'nulldevice.latencyMin',
    number: 0,
  },
}, {
  name: 'timeoutProbability',
  type: 'number',
  tip: true,
  optional: true,
  gte: 0,
  lte: 1,
}, {
  name: 'filter',
  type: 'text',
  tip: true,
  optional: true,
}, {
  name: 'simulatedFilesystemParameters',
  type: 'text',
  tip: true,
  optional: true,
  regex: /^(\d+-\d+(:\d+-\d+)*(:\d+)?)?$/,
  regexAllowBlank: true,
  regexMessage: 'This field should be in format described in the hint',
}, {
  name: 'simulatedFilesystemGrowSpeed',
  type: 'number',
  tip: true,
  optional: true,
  gte: 0,
}, {
  name: 'timeout',
  type: 'number',
  optional: true,
}];
