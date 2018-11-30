import generic from './cluster-storage-add-form/generic';
import luma from './cluster-storage-add-form/luma';
import ceph from './cluster-storage-add-form/ceph';
import cephrados from './cluster-storage-add-form/cephrados';
import posix from './cluster-storage-add-form/posix';
import s3 from './cluster-storage-add-form/s3';
import swift from './cluster-storage-add-form/swift';
import glusterfs from './cluster-storage-add-form/glusterfs';
import webdav from './cluster-storage-add-form/webdav';
import nulldevice from './cluster-storage-add-form/nulldevice';

export default {
  generic,
  luma,
  ceph,
  cephrados,
  posix,
  s3,
  swift,
  glusterfs,
  webdav,
  nulldevice,
  storageType: 'Type',
  save: 'Save',
  add: 'Add',
  cancel: 'Cancel',
};
