/**
 * Shows a small badge informing about the current status of the directory stats service.
 * It's rendered only when the current status represents some type of a change in time
 * (so the "finished" statuses are not visible at all).
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { bool } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { tag } from 'ember-awesome-macros';
import I18n from 'onedata-gui-common/mixins/i18n';

export default Component.extend(I18n, {
  tagName: '',

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.spaceSupportAccountingForm.statusBadge',

  /**
   * @virtual
   * @type {Utils.FormComponent.FormField}
   */
  field: undefined,

  /**
   * @type {ComputedProperty<'initializing'|'stopping'|null>}
   */
  statusToRender: computed(
    'field.dirStatsServiceStatus',
    function statusToRender() {
      const status =
        this.get('field.dirStatsServiceStatus');
      if (status === 'initializing' || status === 'stopping') {
        return status;
      }
      return null;
    }
  ),

  /**
   * @type {ComputedProperty<boolean>}
   */
  shouldBeRendered: bool('statusToRender'),

  /**
   * @type {ComputedProperty<string>}
   */
  badgeClass: tag `status-${'statusToRender'}`,

  /**
   * @type {ComputedProperty<SafeString>}
   */
  badgeText: computed('statusToRender', function badgeText() {
    const statusToRender = this.get('statusToRender');
    if (statusToRender) {
      return this.t(statusToRender);
    }
  }),
});
