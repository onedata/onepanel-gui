import generic from './cluster-storage-add-form/generic';
import luma from './cluster-storage-add-form/luma';
import ceph from './cluster-storage-add-form/ceph';
import cephrados from './cluster-storage-add-form/cephrados';
import posix from './cluster-storage-add-form/posix';
import s3 from './cluster-storage-add-form/s3';
import swift from './cluster-storage-add-form/swift';
import glusterfs from './cluster-storage-add-form/glusterfs';
import xrootd from './cluster-storage-add-form/xrootd';
import webdav from './cluster-storage-add-form/webdav';
import http from './cluster-storage-add-form/http';
import nulldevice from './cluster-storage-add-form/nulldevice';
import nfs from './cluster-storage-add-form/nfs';

export default {
  generic,
  luma,
  ceph,
  cephrados,
  posix,
  s3,
  swift,
  glusterfs,
  xrootd,
  webdav,
  http,
  nulldevice,
  nfs,
  storageType: 'Type',
  save: 'Save',
  add: 'Add',
  cancel: 'Cancel',
  cannotReadonlyNotImported: 'This option is available only for imported storage backends.',
  cannotStorageDetectionReadonly: 'Storage detection is always skipped on readonly storage backends.',
  httpOnlyReadonly: 'HTTP storages are limited to readonly mode.',
  httpOnlyImported: 'HTTP storages are always treated as imported due to their readonly limitation.',
};
