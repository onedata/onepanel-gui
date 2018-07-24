/**
 * Information about attributes of various storage
 *
 * Used to generate add storage forms and display information about storages.
 *
 * @module utils/cluster-storages/storage-types
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import CEPHRADOS_FIELDS from 'onepanel-gui/utils/cluster-storage/cephrados-fields';
import CEPH_FIELDS from 'onepanel-gui/utils/cluster-storage/ceph-fields';
import POSIX_FIELDS from 'onepanel-gui/utils/cluster-storage/posix-fields';
import S3_FIELDS from 'onepanel-gui/utils/cluster-storage/s3-fields';
import SWIFT_FIELDS from 'onepanel-gui/utils/cluster-storage/swift-fields';
import GLUSTERFS_FIELDS from 'onepanel-gui/utils/cluster-storage/glusterfs-fields';
import NULLDEVICE_FIELDS from 'onepanel-gui/utils/cluster-storage/nulldevice-fields';

export default [{
    id: 'ceph',
    name: 'Ceph',
    fields: CEPH_FIELDS,
  },
  {
    id: 'cephrados',
    name: 'Ceph RADOS',
    fields: CEPHRADOS_FIELDS,
  },
  {
    id: 'posix',
    name: 'POSIX',
    fields: POSIX_FIELDS,
  }, {
    id: 's3',
    name: 'S3',
    fields: S3_FIELDS,
  }, {
    id: 'swift',
    name: 'Swift',
    fields: SWIFT_FIELDS,
  }, {
    id: 'glusterfs',
    name: 'GlusterFS',
    fields: GLUSTERFS_FIELDS,
  }, {
    id: 'nulldevice',
    name: 'Null Device',
    fields: NULLDEVICE_FIELDS,
  },
];
