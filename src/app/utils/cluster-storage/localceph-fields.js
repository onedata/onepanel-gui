export default [
  {
    name: 'copiesNumber',
    type: 'number',
    defaultValue: 1,
    gte: 1,
    lte: {
      property: 'meta.osdsNumber',
      message: 'components.clusterStorageAddForm.localceph.copiesNumber.lteMessage',
    },
  },
  {
    name: 'minCopiesNumber',
    type: 'number',
    defaultValue: 1,
    gte: 1,
    lte: {
      property: 'localceph.copiesNumber',
      message: 'components.clusterStorageAddForm.localceph.minCopiesNumber.lteMessage',
    },
  },
  {
    name: 'timeout',
    type: 'number',
    optional: true,
  },
  {
    name: 'insecure',
    type: 'checkbox',
    optional: true,
    defaultValue: true,
  },
  {
    name: 'readonly',
    type: 'checkbox',
    optional: true,
  },
];
