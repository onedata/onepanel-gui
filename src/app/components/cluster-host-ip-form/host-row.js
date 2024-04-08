/**
 * A row in IP form-table that allows to set IP address for single hostname
 *
 * @author Jakub Liput
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { observer } from '@ember/object';
import { reads } from '@ember/object/computed';
import notImplementedWarn from 'onedata-gui-common/utils/not-implemented-warn';
import I18n from 'onedata-gui-common/mixins/i18n';

import { validator, buildValidations } from 'ember-cp-validations';

const reValidIpAddress =
  /^(?:(?:2[0-4]\d|25[0-5]|1\d{2}|[1-9]?\d)\.){3}(?:2[0-4]\d|25[0-5]|1\d{2}|[1-9]?\d)$/;

const Validations = buildValidations({
  ip: [
    validator('presence', { presence: true }),
    validator('format', {
      regex: reValidIpAddress,
      message: 'The value should be a valid IP address',
    }),
  ],
});

export default Component.extend(Validations, I18n, {
  tagName: 'tr',
  classNames: ['cluster-host-ip-form-row'],
  classNameBindings: ['active'],
  attributeBindings: ['hostname:data-hostname'],

  i18nPrefix: 'components.clusterHostIpForm.hostRow',

  /**
   * @virtual
   * @type {string}
   */
  hostname: undefined,

  /**
   * @virtual
   * @type {string}
   */
  ip: undefined,

  /**
   * @virtual
   * @type {boolean}
   */
  isReadOnly: false,

  /**
   * @virtual
   * @type {function} `(hostname: string, ipAddress: string) => any`
   */
  valueChanged: notImplementedWarn,

  /**
   * @virtual
   * @type {function} `(hostname: string, validation: ValidationObject) => any`
   */
  validationChanged: notImplementedWarn,

  /**
   * @type {boolean}
   */
  active: false,

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  validationMessage: reads('validations.attrs.ip.message'),

  /**
   * @type {ClusterHostInfo}
   */
  dataHostname: reads('hostname'),

  observeValidationChanged: observer(
    'validations.attrs.ip.isValid',
    function notifyValidationChanged() {
      this.get('validationChanged')(
        this.get('hostname'),
        this.get('validations.attrs.ip')
      );
    }
  ),

  init() {
    this._super(...arguments);
    this.observeValidationChanged();
  },

  actions: {
    headerClick() {
      this.toggleProperty('active');
    },

    /**
     * @param {Event} event
     */
    valueChanged(event) {
      this.get('valueChanged')(this.get('hostname'), event.target.value);
    },
  },
});
