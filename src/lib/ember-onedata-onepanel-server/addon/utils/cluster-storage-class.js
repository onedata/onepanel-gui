import Onepanel from 'npm:onepanel';

const {
  Posix,
  S3,
  Ceph,
  Cephrados,
  Localceph,
  Swift,
  Glusterfs,
  Webdav,
  Nulldevice,
} = Onepanel;

function clusterStorageClass(storageType) {
  switch (storageType) {
    case 's3':
      return S3;
    case 'ceph':
      return Ceph;
    case 'cephrados':
      return Cephrados;
    case 'localceph':
      return Localceph;
    case 'posix':
      return Posix;
    case 'swift':
      return Swift;
    case 'glusterfs':
      return Glusterfs;
    case 'webdav':
      return Webdav;
    case 'nulldevice':
      return Nulldevice;
    default:
      return undefined;
  }
}

export default clusterStorageClass;
