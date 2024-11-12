export default [
  { name: 'mountPoint', type: 'text' },
  {
    name: 'rootUid',
    type: 'number',
    tip: 'UID of the user on whose behalf operations in the admin context will be performed on the storage.',
    optional: true,
    integer: true,
    gte: 0,
    defaultPlaceholder: 0,
    isDefault: true,
  },
  {
    name: 'rootGid',
    type: 'number',
    tip: 'GID of the group on whose behalf operations in the admin context will be performed on the storage.',
    optional: true,
    integer: true,
    gte: 0,
    defaultPlaceholder: 0,
    isDefault: true,
  },
  { name: 'timeout', type: 'number', optional: true },
];
