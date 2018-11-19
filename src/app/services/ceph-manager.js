import Service, { inject as service } from '@ember/service';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import CephClusterConfiguration from 'onepanel-gui/utils/ceph/cluster-configuration';
import _ from 'lodash';
import { getOwner } from '@ember/application';

export default Service.extend({
  onepanelServer: service(),

  /**
   * Returns ceph cluster configuration - aggregates results from multiple
   * requests to form complex configuration object.
   * @return {PromiseObject<Utils/Ceph/ClusterConfiguration>}
   */
  getConfiguration() {
    const onepanelServer = this.get('onepanelServer');
    return PromiseObject.create({
      promise: Promise.all([
        onepanelServer.request('oneprovider', 'getCephManagers'),
        onepanelServer.request('oneprovider', 'getCephMonitors'),
        onepanelServer.request('oneprovider', 'getCephOsds'),
        onepanelServer.request('oneprovider', 'getCephParams'),
      ]).then(([
        { data: managers },
        { data: monitors },
        { data: osds },
        { data: general },
      ]) => {
        const rawConfig = _.assign({}, general, {
          managers,
          monitors,
          osds,
        });
        const config = CephClusterConfiguration.create(
          getOwner(this).ownerInjection()
        );
        config.fillIn(rawConfig);
        return config;
      }),
    });
  },
});
