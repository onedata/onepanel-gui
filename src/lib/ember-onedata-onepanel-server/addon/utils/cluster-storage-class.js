/**
 * Exports function, that maps storageType to corresponding class from
 * Onepanel JS client.
 *
 * @module utils/cluster-storage-class
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

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
  Embeddedceph,
  EmbeddedcephModify,
  Swift,
  SwiftModify,
  Glusterfs,
  GlusterfsModify,
  Webdav,
  WebdavModify,
  Nulldevice,
  NulldeviceModify,
} = Onepanel;

/**
 * @param {string} storageType 
 * @param {boolean} [modify=false] if true, class for storage edition will be
 *   returned
 * @returns {Object} class for given storageType
 */
function clusterStorageClass(storageType, modify = false) {
  switch (storageType) {
    case 's3':
      return modify ? S3Modify : S3;
    case 'ceph':
      return modify ? CephModify : Ceph;
    case 'cephrados':
      return modify ? CephradosModify : Cephrados;
    case 'localceph':
      return modify ? EmbeddedcephModify : Embeddedceph;
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
