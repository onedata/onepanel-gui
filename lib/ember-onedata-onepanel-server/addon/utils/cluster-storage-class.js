import Onepanel from 'npm:onepanel';

const {
  POSIX,
  S3,
  Ceph,
  Swift,
} = Onepanel;

function clusterStorageClass(storageType) {
  switch (storageType) {
  case 's3':
    return S3;
  case 'ceph':
    return Ceph;
  case 'posix':
    return POSIX;
  case 'swift':
    return Swift;
  default:
    return undefined;
  }
}

export default clusterStorageClass;
