export default {
  mountPoint: {
    label: 'Mount point',
    tip: 'Absolute path to the root directory of the storage filesystem. The directory must exist and be accessible. In containerized deployments, this path refers to a location inside the container (Docker/pod) and <strong>must be mounted referencing an external persistent storage</strong> (e.g., host filesystem or network storage), except for non-persistent (testing) deployments.',
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
};
