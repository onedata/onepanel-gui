import Component from '@ember/component';
import { get, set, observer } from '@ember/object';
import { alias } from '@ember/object/computed';
import notImplementedThrow from 'onedata-gui-common/utils/not-implemented-throw';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import CephClusterConfiguration from 'onepanel-gui/utils/ceph/cluster-configuration';
import { getOwner } from '@ember/application';
import _ from 'lodash';

export default Component.extend(I18n, {
  /**
   * @override
   */
  i18nPrefix: 'components.newClusterCeph',

  /**
   * @type {function}
   */
  nextStep: notImplementedThrow,

  /**
   * @type {function}
   */
  prevStep: notImplementedThrow,

  /**
   * @type {Utils/NewClusterDeployProcess}
   */
  stepData: undefined,

  /**
   * @type {Ember.ComputedProperty<Utils/NewClusterDeployProcess>}
   */
  clusterDeployProcess: alias('stepData'),

  /**
   * @type {Ember.ComputedProperty<Utils/Ceph/ClusterConfiguration>}
   */
  cephConfig: undefined,

  cephConfigObserver: observer(
    'clusterDeployProcess.{cephNodes,configuration.ceph}',
    function cephConfigObserver() {
      let {
        clusterDeployProcess,
        cephConfig,
      } = this.getProperties('clusterDeployProcess', 'cephConfig');
      const rawConfig = get(clusterDeployProcess, 'configuration.ceph');
      if (!cephConfig) {
        cephConfig = CephClusterConfiguration.create(
          getOwner(this).ownerInjection()
        );
        get(clusterDeployProcess, 'cephNodes').forEach(host => {
          cephConfig.addNode(host);
        });
        this.set('cephConfig', cephConfig);
      }
      if (!_.isEqual(cephConfig.toRawConfig(), rawConfig) && rawConfig) {
        cephConfig.fillIn(rawConfig);
      }
      return cephConfig;
    }
  ),

  init() {
    this._super(...arguments);
    this.cephConfigObserver();
    this.set('clusterDeployProcess.onFinish', () => this.get('nextStep')());
  },

  actions: {
    prevStep() {
      const {
        prevStep,
        clusterDeployProcess,
        cephConfig,
      } = this.getProperties('prevStep', 'clusterDeployProcess', 'cephConfig');
      set(clusterDeployProcess, 'configuration.ceph', cephConfig.toRawConfig());
      prevStep(clusterDeployProcess);
    },
    startDeploy() {
      const cephConfig = this.get('cephConfig').toRawConfig();
      const clusterDeployProcess = this.get('clusterDeployProcess');
      set(clusterDeployProcess, 'configuration.ceph', cephConfig);
      return this.get('clusterDeployProcess').startDeploy();
    },
  },
});
