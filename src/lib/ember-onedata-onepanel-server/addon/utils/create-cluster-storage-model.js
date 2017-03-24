import clusterStorageClass from 'ember-onedata-onepanel-server/utils/cluster-storage-class';

/**
 * Create an instance of ClusterStorages using data from add storage form
 * @param {object} formData
 * @returns {subclass of ClusterStorages}
 */
function createClusterStorage(formData) {
  let csClass = clusterStorageClass(formData.type);
  return csClass.constructFromObject(formData);
}

export default createClusterStorage;
