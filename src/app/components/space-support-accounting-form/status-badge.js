import Component from '@ember/component';
import { computed } from '@ember/object';
import { bool } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { tag } from 'ember-awesome-macros';
import I18n from 'onedata-gui-common/mixins/components/i18n';

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
    'field.dirStatsCollectingStatus',
    function statusToRender() {
      const status =
        this.get('field.dirStatsCollectingStatus');
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
