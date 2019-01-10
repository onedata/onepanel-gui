/**
 * Onepanel specific actions for clusters
 *
 * @module services/cluster-actions
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import ClusterActions from 'onedata-gui-common/services/cluster-actions';

export default ClusterActions.extend({
  onezoneGui: service(),

  _window: window,

  /**
   * @override
   */
  addAction: computed(function addAction() {
    const {
      _window,
      onezoneGui,
    } = this.getProperties('_window', 'onezoneGui');
    return () => _window.location = onezoneGui.getUrlInOnezone('clusters/add');
  }),
});
