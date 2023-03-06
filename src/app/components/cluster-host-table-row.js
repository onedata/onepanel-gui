/**
 * Single row of cluster hosts table
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { alias } from '@ember/object/computed';
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';
import notImplementedWarn from 'onedata-gui-common/utils/not-implemented-warn';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { computed, get } from '@ember/object';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import { inject as service } from '@ember/service';

export default Component.extend({
  tagName: 'tr',
  classNames: ['cluster-host-table-row', 'animated', 'infinite'],
  classNameBindings: ['active', 'blinking:pulse-bg-mint'],
  attributeBindings: ['dataHostname:data-hostname'],

  onepanelServer: service(),

  /**
   * @virtual
   * @type {ClusterHostInfo}
   */
  host: undefined,

  /**
   * @virtual
   * @type {Function}
   */
  checkboxChanged: notImplementedWarn,

  /**
   * @virtual
   * @type {Function} (hostname: string) => Promise
   */
  removeHost: notImplementedReject,

  /**
   * @virtual
   * @type {boolean}
   */
  isMobile: undefined,

  /**
   * @type {boolean}
   * @virtual
   */
  showCeph: false,

  removeAvailable: computed('removeHost', function () {
    return this.get('removeHost') !== notImplementedReject;
  }),

  /**
   * @type {boolean}
   */
  active: false,

  /**
   * @type {boolean}
   */
  blinking: false,

  /**
   * @type {ClusterHostInfo}
   */
  dataHostname: alias('host.hostname'),

  /**
   * @type {boolean}
   */
  _removeDisabled: false,

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isRemoveHostBtnDisabled: computed(
    'isThisHost.{isSettled,content}',
    function isRemoveHostBtnDisabled() {
      const isThisHost = this.get('isThisHost');
      if (get(isThisHost, 'isSettled')) {
        if (get(isThisHost, 'isRejected')) {
          return true;
        } else {
          return Boolean(get(isThisHost, 'content'));
        }
      } else {
        return true;
      }
    }
  ),

  /**
   * True if this row represents current host
   * @type {Ember.ComputedProperty<Promise<boolean>>}
   */
  isThisHost: computed('onepanelServer.nodeProxy', 'dataHostname', function () {
    const {
      onepanelServer,
      dataHostname,
    } = this.getProperties('onepanelServer', 'dataHostname');
    return PromiseObject.create({
      promise: onepanelServer.getNodeProxy()
        .then(({ hostname }) => hostname)
        .then(hostname => hostname === dataHostname),
    });
  }),

  actions: {
    headerClick() {
      this.toggleProperty('active');
    },
    checkboxChanged(
      newValue,
      context
    ) {
      const hostname = context.get('hostHostname');
      const option = context.get('hostOption');
      this.get('checkboxChanged')(hostname, option, newValue);
    },
    primaryClusterManagerChanged() {
      this.get('primaryClusterManagerChanged')(...arguments);
    },
    removeHost() {
      const {
        removeHost,
        dataHostname,
      } = this.getProperties('removeHost', 'dataHostname');
      this.set('_removeDisabled', true);
      return removeHost(dataHostname)
        .finally(() => safeExec(this, 'set', '_removeDisabled', false));
    },
  },
});
