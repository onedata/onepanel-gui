/**
 * A component that renders an overview of spaces supported by the specified provider
 * in the form of a table, showing only the first few most supported spaces.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import bytesToString from 'onedata-gui-common/utils/bytes-to-string';
import I18n from 'onedata-gui-common/mixins/i18n';
import { computed } from '@ember/object';

export default Component.extend(I18n, {
  classNames: ['provider-spaces-support-table'],

  i18nPrefix: 'components.providerSpacesSupportTable',

  /**
   * @virtual
   * @type {string}
   */
  providerId: undefined,

  /**
   * @virtual
   * @type {PromiseArray<Spaces>}
   */
  spaces: undefined,

  /**
   * @type {number}
   */
  maxDisplayedSpaces: 4,

  sortedSpaces: computed('spaces', function sortedSpaces() {
    return this.spaces.content.sort((a, b) =>
      b.supportingProviders[this.providerId] - a.supportingProviders[this.providerId]
    );
  }),

  /**
   * @type {ComputedProperty<number>}
   */
  hiddenSpacesCount: computed(
    'spaces',
    'maxDisplayedSpaces',
    function hiddenSpacesCount() {
      return this.spaces.length - this.maxDisplayedSpaces;
    }
  ),

  /**
   * @type {ComputedProperty<string>}
   */
  totalSize: computed('sortedSpaces', function totalSize() {
    return this.formatValue(this.sortedSpaces.reduce((acc, b) =>
      acc + b.supportingProviders[this.providerId], 0));
  }),

  spacesToShow: computed(
    'sortedSpaces',
    'maxDisplayedSpaces',
    function spacesToShow() {
      return this.sortedSpaces.slice(0, this.maxDisplayedSpaces).map(space => {
        space.sizeToShow = this.formatValue(space.supportingProviders[this.providerId]);
        return space;
      });
    }
  ),

  /**
   * Returns size as a string.
   * @param {number} value A size.
   * @returns {string} A size string representation.
   */
  formatValue(value) {
    return bytesToString(value, { iecFormat: true });
  },
});
