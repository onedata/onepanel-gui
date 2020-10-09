export default [{
  name: 'copiesNumber',
  type: 'number',
  tip: true,
  defaultValue: 1,
  gte: 1,
  lte: {
    property: 'meta.osdsNumber',
    message: 'components.clusterStorageAddForm.localceph.copiesNumber.lteMessage',
  },
}, {
  name: 'minCopiesNumber',
  type: 'number',
  tip: true,
  defaultValue: 1,
  gte: 1,
  lte: {
    property: 'localceph.copiesNumber',
    message: 'components.clusterStorageAddForm.localceph.minCopiesNumber.lteMessage',
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
