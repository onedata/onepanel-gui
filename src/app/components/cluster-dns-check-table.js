import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import assertProperty from 'onedata-gui-common/utils/assert-property';

export default Component.extend(I18n, {
  classNames: ['cluster-dns-check-table'],

  i18nPrefix: 'components.clusterDnsCheckTable',

  /**
   * @virtual
   * @type {string}
   */
  onepanelServiceType: undefined,

  /**
   * @virtual
   */
  checkResultItems: undefined,

  /**
   * @virtual
   * @type {boolean}
   */
  builtInDnsServer: undefined,

  /**
   * @virtual
   * @type {string}
   */
  domain: undefined,

  /**
   * @virtual
   * @type {string}
   */
  providerOnezoneDomain: undefined,

  init() {
    this._super(...arguments);
    assertProperty(this, 'onepanelServiceType');
    assertProperty(this, 'checkResultItems');
  },
});
