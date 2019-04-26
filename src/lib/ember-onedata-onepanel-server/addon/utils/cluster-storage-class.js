import Onepanel from 'npm:onepanel';

const {
  Posix,
  PosixModify,
  S3,
  S3Modify,
  Ceph,
  CephModify,
  Cephrados,
  CephradosModify,
  Swift,
  SwiftModify,
  Glusterfs,
  GlusterfsModify,
  Webdav,
  WebdavModify,
  Nulldevice,
  NulldeviceModify,
} = Onepanel;

function clusterStorageClass(storageType, modify = false) {
  switch (storageType) {
    case 's3':
      return modify ? S3Modify : S3;
    case 'ceph':
      return modify ? CephModify : Ceph;
    case 'cephrados':
      return modify ? CephradosModify : Cephrados;
    case 'posix':
      return modify ? PosixModify : Posix;
    case 'swift':
      return modify ? SwiftModify : Swift;
    case 'glusterfs':
      return modify ? GlusterfsModify : Glusterfs;
    case 'webdav':
      return modify ? WebdavModify : Webdav;
    case 'nulldevice':
      return modify ? NulldeviceModify : Nulldevice;
    default:
      return undefined;
  }
}

export default clusterStorageClass;
