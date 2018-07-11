import posix from './storage-item/posix';
import ceph from './storage-item/ceph';
import s3 from './storage-item/s3';
import swift from './storage-item/swift';
import glusterfs from './storage-item/glusterfs';
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
  s3,
  swift,
  glusterfs,
  nulldevice,
};
