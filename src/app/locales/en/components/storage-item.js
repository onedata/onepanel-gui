import posix from './storage-item/posix';
import ceph from './storage-item/ceph';
import s3 from './storage-item/s3';
import swift from './storage-item/swift';

export default {
  generic: {
    type: 'Type',
    timeout: 'Timeout',
    readonly: 'Is readonly',
  },
  posix,
  ceph,
  s3,
  swift,
};
