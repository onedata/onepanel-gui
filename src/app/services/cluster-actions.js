/**
 * Onepanel specific actions for clusters
 *
 * @module services/cluster-actions
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import ClusterActions from 'onedata-gui-common/services/cluster-actions';
import { equal } from '@ember/object/computed';

export default ClusterActions.extend({
  onezoneGui: service(),
  clusterModelManager: service(),
  onepanelServer: service(),

  /**
   * @type {Window}
   */
  _window: window,

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isDeployed: equal('clusterModelManager.currentCluster.isNotDeployed', false),

  /**
   * @override
   */
  buttons: computed('btnAdd', 'btnJoin', 'isDeployed', function buttons() {
    const {
      isDeployed,
      btnAdd,
      btnJoin,
    } = this.getProperties('isDeployed', 'btnAdd', 'btnJoin');
    return isDeployed ? [btnAdd, btnJoin] : [];
  }),

  /**
   * @override
   */
  addAction: computed(function addAction() {
    const {
      _window,
      onezoneGui,
    } = this.getProperties('_window', 'onezoneGui');
    return () =>
      _window.location = onezoneGui.getUrlInOnezone('onedata/clusters/add');
  }),

  /**
   * @override
   */
  btnAdd: computed('addAction', function btnAdd() {
    const isEmergency = this.get('onepanelServer.isEmergency');
    return {
      icon: 'add-filled',
      title: this.t('btnAdd.title'),
      tip: isEmergency ? this.t('btnAdd.viaOnezoneHint') : this.t('btnAdd.hint'),
      class: 'add-cluster-btn',
      action: this.get('addAction'),
      disabled: isEmergency,
    };
  }),

  /**
   * @override
   */
  joinAction: computed(function addAction() {
    const {
      _window,
      onezoneGui,
    } = this.getProperties('_window', 'onezoneGui');
    return () =>
      _window.location = onezoneGui.getUrlInOnezone('onedata/clusters/join');
  }),

  /**
   * @override
   */
  btnJoin: computed('joinAction', function btnJoin() {
    const isStandalone = this.get('onepanelServer.isStandalone');
    return {
      icon: 'join-plug',
      title: this.t('btnJoin.title'),
      tip: isStandalone ? this.t('btnAdd.viaOnezoneHint') : this.t('btnJoin.hint'),
      class: 'join-cluster-btn',
      action: this.get('joinAction'),
      disabled: isStandalone,
    };
  }),
});
