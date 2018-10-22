import posix from './storage-item/posix';
import ceph from './storage-item/ceph';
import cephrados from './storage-item/cephrados';
import s3 from './storage-item/s3';
import swift from './storage-item/swift';
import glusterfs from './storage-item/glusterfs';
import webdav from './storage-item/webdav';
import nulldevice from './storage-item/nulldevice';

export default {
  generic: {
    id: 'Id',
    type: 'Type',
    timeout: 'Timeout',
    readonly: 'Is readonly',
    supportedSpaces: {
      title: 'Supported spaces',
      space: 'Space',
      noSpacesSupported: 'No spaces supported',
    },
  },
  posix,
  ceph,
  cephrados,
  s3,
  swift,
  glusterfs,
  webdav,
  nulldevice,
};
