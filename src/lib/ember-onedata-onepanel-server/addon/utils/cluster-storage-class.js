import Onepanel from 'npm:onepanel';

const {
  Posix,
  S3,
  Ceph,
  Swift,
  Glusterfs,
  NullDevice,
} = Onepanel;

function clusterStorageClass(storageType) {
  switch (storageType) {
    case 's3':
      return S3;
    case 'ceph':
      return Ceph;
    case 'posix':
      return Posix;
    case 'swift':
      return Swift;
    case 'glusterfs':
      return Glusterfs;
    case 'nulldevice':
      return NullDevice;
    default:
      return undefined;
  }
}

export default clusterStorageClass;
