import clusterStorageClass from 'ember-onedata-onepanel-server/utils/cluster-storage-class';

/**
 * Create an instance of ClusterStorages using data from add storage form
 * @param {object} formData contains attributes for specific storage type as in REST API
 * @param {boolean} modify if true, model for modification instead of creation will be used
 * @returns {ClusterStorages} instance of ClusterStorages subclass
 */
function createClusterStorage(formData, modify = false) {
  let csClass = clusterStorageClass(formData.type, modify);
  return csClass.constructFromObject(formData);
}

export default createClusterStorage;
