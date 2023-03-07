/**
 * Information about attributes of various storage
 *
 * Used to generate add storage forms and display information about storages.
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import CEPHRADOS_FIELDS from 'onepanel-gui/utils/cluster-storage/cephrados-fields';
import CEPH_FIELDS from 'onepanel-gui/utils/cluster-storage/ceph-fields';
import POSIX_FIELDS from 'onepanel-gui/utils/cluster-storage/posix-fields';
import NFS_FIELDS from 'onepanel-gui/utils/cluster-storage/nfs-fields';
import S3_FIELDS from 'onepanel-gui/utils/cluster-storage/s3-fields';
import SWIFT_FIELDS from 'onepanel-gui/utils/cluster-storage/swift-fields';
import GLUSTERFS_FIELDS from 'onepanel-gui/utils/cluster-storage/glusterfs-fields';
import WEBDAV_FIELDS from 'onepanel-gui/utils/cluster-storage/webdav-fields';
import HTTP_FIELDS from 'onepanel-gui/utils/cluster-storage/http-fields';
import XROOTD_FIELDS from 'onepanel-gui/utils/cluster-storage/xrootd-fields';
import NULLDEVICE_FIELDS from 'onepanel-gui/utils/cluster-storage/nulldevice-fields';
import EMBEDDEDCEPH_FIELDS from 'onepanel-gui/utils/cluster-storage/embeddedceph-fields';

export default [{
    id: 'cephrados',
    name: 'Ceph RADOS',
    fields: CEPHRADOS_FIELDS,
  },
  {
    id: 'embeddedceph',
    name: 'Embedded Ceph',
    fields: EMBEDDEDCEPH_FIELDS,
  },
  {
    id: 'posix',
    name: 'POSIX',
    fields: POSIX_FIELDS,
  },
  {
    id: 'nfs',
    name: 'NFS',
    fields: NFS_FIELDS,
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
    id: 'webdav',
    name: 'WebDAV',
    fields: WEBDAV_FIELDS,
  }, {
    id: 'http',
    name: 'HTTP',
    fields: HTTP_FIELDS,
  },
  {
    id: 'xrootd',
    name: 'XRootD',
    fields: XROOTD_FIELDS,
  },
  {
    id: 'nulldevice',
    name: 'Null Device',
    fields: NULLDEVICE_FIELDS,
  }, {
    id: 'ceph',
    name: 'Ceph (deprecated)',
    fields: CEPH_FIELDS,
  },
];
