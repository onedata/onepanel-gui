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
import { equal, collect } from '@ember/object/computed';
import { conditional, raw } from 'ember-awesome-macros';

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
  buttons: conditional(
    'isDeployed',
    collect('btnAdd'),
    raw([])
  ),

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
});
