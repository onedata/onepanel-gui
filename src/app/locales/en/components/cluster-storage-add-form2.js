import basic from './cluster-storage-add-form2/generic';
import cephrados from './cluster-storage-add-form2/cephrados';
import posix from './cluster-storage-add-form2/posix';
import s3 from './cluster-storage-add-form2/s3';
import swift from './cluster-storage-add-form2/swift';
import glusterfs from './cluster-storage-add-form2/glusterfs';
import xrootd from './cluster-storage-add-form2/xrootd';
import webdav from './cluster-storage-add-form2/webdav';
import http from './cluster-storage-add-form2/http';
import nulldevice from './cluster-storage-add-form2/nulldevice';
import nfs from './cluster-storage-add-form2/nfs';

export default {
  fields: {
    basic,
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
  },

  storageType: 'Type',
  save: 'Save',
  add: 'Add',
  cancel: 'Cancel',
  cannotReadonlyNotImported: 'This option is available only for imported storage backends.',
  cannotStorageDetectionReadonly: 'Storage detection is always skipped on readonly storage backends.',
  httpOnlyReadonly: 'HTTP storages are limited to readonly mode.',
  httpOnlyImported: 'HTTP storages are always treated as imported due to their readonly limitation.',
};
