import common from './common';

export default {
  mountPoint: {
    label: 'Mount point',
    placeholder: 'Example: /mnt/volume0',
  },
  rootUid: {
    label: 'Root UID',
    tip: 'UID of the user on whose behalf operations in the admin context will be performed on the storage.',
    placeholder: 'Default: 0',
  },
  rootGid: {
    label: 'Root GID',
    tip: 'GID of the group on whose behalf operations in the admin context will be performed on the storage.',
    placeholder: 'Default: 0',
  },
  timeout: common.timeout,
};
