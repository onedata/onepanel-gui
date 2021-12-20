export default [{
  name: 'copiesNumber',
  type: 'number',
  tip: true,
  defaultValue: 1,
  gte: 1,
  lte: {
    property: 'meta.osdsNumber',
    message: 'components.clusterStorageAddForm.embeddedceph.copiesNumber.lteMessage',
  },
}, {
  name: 'minCopiesNumber',
  type: 'number',
  tip: true,
  defaultValue: 1,
  gte: 1,
  lte: {
    property: 'embeddedceph.copiesNumber',
    message: 'components.clusterStorageAddForm.embeddedceph.minCopiesNumber.lteMessage',
  },
}, {
  name: 'blockSize',
  type: 'number',
  example: '4194304',
  gt: 0,
  notEditable: true,
  optional: true,
  tip: true,
}, {
  name: 'timeout',
  type: 'number',
  optional: true,
}];
