import generic from './cluster-storage-add-form/generic';
import luma from './cluster-storage-add-form/luma';
import ceph from './cluster-storage-add-form/ceph';
import cephrados from './cluster-storage-add-form/cephrados';
import localceph from './cluster-storage-add-form/localceph';
import posix from './cluster-storage-add-form/posix';
import s3 from './cluster-storage-add-form/s3';
import swift from './cluster-storage-add-form/swift';
import glusterfs from './cluster-storage-add-form/glusterfs';
import xrootd from './cluster-storage-add-form/xrootd';
import webdav from './cluster-storage-add-form/webdav';
import http from './cluster-storage-add-form/http';
import nulldevice from './cluster-storage-add-form/nulldevice';

export default {
  generic,
  luma,
  ceph,
  cephrados,
  localceph,
  posix,
  s3,
  swift,
  glusterfs,
  xrootd,
  webdav,
  http,
  nulldevice,
  storageType: 'Type',
  save: 'Save',
  add: 'Add',
  cancel: 'Cancel',
  modifyStorageModalHeader: 'Modify storage',
  modifyStorageModalMessage: 'Are you sure you want to modify storage details? Incorrect configuration can make your data unavailable.',
  cannotReadonlyNotImported: 'Storage cannot be configured as readonly because it is not an imported storage.',
};
