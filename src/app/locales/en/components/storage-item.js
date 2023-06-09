import posix from './storage-item/posix';
import ceph from './storage-item/ceph';
import cephrados from './storage-item/cephrados';
import s3 from './storage-item/s3';
import swift from './storage-item/swift';
import glusterfs from './storage-item/glusterfs';
import webdav from './storage-item/webdav';
import nulldevice from './storage-item/nulldevice';
import nfs from './storage-item/nfs';

export default {
  modifyBtn: 'Modify',
  modifyDisabledBtnTip: 'Current modifications have not been saved yet – use the buttons at the bottom of the form.',
  modifyStorageDetails: 'Modify storage details',
  cancelStorageModification: 'Cancel modification',
  removeStorage: 'Remove storage',
  // TODO: VFS-11005 Handle single load errors
  unknown: 'unknown',
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
  nfs,
};
