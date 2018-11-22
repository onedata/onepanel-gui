import clusterStorageClass from 'ember-onedata-onepanel-server/utils/cluster-storage-class';
import { get, set } from '@ember/object';
import _ from 'lodash';
import Onepanel from 'npm:onepanel';

/**
 * Create an instance of ClusterStorages using data from add storage form
 * @param {object} formData contains attributes for specific storage type as in REST API
 * @returns {ClusterStorages} instance of ClusterStorages subclass
 */
function createClusterStorage(formData) {
  const type = get(formData, 'type');
  let csClass, csData;
  if (type === 'localceph') {
    /**
     * Change object `{ poolA, poolB, ... abc, def, ghi, ...}` to
     * `{ a, b, ... storageParams: { abc, def, ghi, ... } }`
     */
    const formDataKeys = Object.keys(formData);
    const poolFieldsPrefix = 'pool';
    csData = {};
    formDataKeys
      .filter(key => _.startsWith(key, poolFieldsPrefix))
      .forEach(key => {
        const unprefixedKey =
          _.lowerFirst(key.substring(get(poolFieldsPrefix, 'length')));
        set(csData, unprefixedKey, get(formData, key));
      });
    const storageParams = {};
    formDataKeys
      .filter(key => !_.startsWith(key, poolFieldsPrefix))
      .forEach(key => set(storageParams, key, get(formData, key)));
    set(csData, 'storageParams', storageParams);
    csClass = Onepanel.CephPool;
  } else {
    csClass = clusterStorageClass(formData.type);
    csData = formData;
  }
  return csClass.constructFromObject(csData);
}

export default createClusterStorage;
