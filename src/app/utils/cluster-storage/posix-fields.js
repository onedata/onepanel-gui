export default [
  { name: 'mountPoint', type: 'text' },
  {
    name: 'rootUid',
    type: 'number',
    tip: 'UID of the user on whose behalf operations in the admin context will be performed on the storage. Default: 0.',
    optional: true,
    gte: 0,
  },
  {
    name: 'rootGid',
    type: 'number',
    tip: 'GID of the group on whose behalf operations in the admin context will be performed on the storage. Default: 0.',
    optional: true,
    gte: 0,
  },
  { name: 'timeout', type: 'number', optional: true },
];
