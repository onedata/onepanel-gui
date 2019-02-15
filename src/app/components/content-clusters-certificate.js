/**
 * Information and modification of cluster web certificate
 *
 * @module components/content-cluster-certificate
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { reads } from '@ember/object/computed';

import { inject as service } from '@ember/service';
import EmberObject, { get, computed, setProperties, observer } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import GlobalActions from 'onedata-gui-common/mixins/components/global-actions';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import Looper from 'onedata-gui-common/utils/looper';
import changeDomain from 'onepanel-gui/utils/change-domain';
import config from 'ember-get-config';
import computedPipe from 'onedata-gui-common/utils/ember/computed-pipe';

const {
  time: {
    redirectDomainDelay,
  },
} = config;

/**
 * @type {Number} interval in ms
 */
const webCertPollInterval = 2000;

export default Component.extend(I18n, GlobalActions, {
  webCertManager: service(),
  onepanelServer: service(),
  deploymentManager: service(),
  providerManager: service(),
  globalNotify: service(),
  guiUtils: service(),

  i18nPrefix: 'components.contentClustersCertificate',

  /**
   * @type {Looper|undefined}
   */
  webCertPollLooper: undefined,

  /**
   * @type {boolean}
   */
  _editing: false,

  /**
   * Created/updated by `updateWebCertProxy`
   * @type {PromiseObject<Onepanel.WebCert>}
   */
  webCertProxy: undefined,

  /**
   * Promise object for regenerating cert request
   * @type {PromiseObject}
   */
  regenerateProxy: undefined,

  /**
   * If true, show blocking message about redirection pending
   * @type {boolean}
   */
  showRedirectPage: false,

  onepanelServiceType: reads('guiUtils.serviceType'),

  /**
   * True, if regenerate action is pending
   * @type {Ember.ComputedProperty<boolean>}
   */
  regeneratePending: reads('regenerateProxy.isPending'),

  letsEncrypt: reads('webCert.letsEncrypt'),

  status: reads('webCert.status'),

  expirationTime: reads('webCert.expirationTime'),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  shouldPollWebCert: computed(
    'status',
    'regeneratePending',
    function shouldPollWebCert() {
      return this.get('status') === 'regenerating' ||
        this.get('regeneratePending');
    }
  ),

  /**
   * @type {EmberObject<Onepanel.WebCert>}
   */
  webCert: computedPipe('webCertProxy.content', EmberObject.create.bind(EmberObject)),

  _formTitle: computed(function _formTitle() {
    return this.t('formTitleStatic');
  }),

  /**
   * @type {Ember.ComputedProperty<PromiseObject<string|undefined>>}
   */
  redirectDomain: computed('onepanelServiceType', function redirectDomain() {
    const onepanelServiceType = this.get('onepanelServiceType');
    let promise;
    switch (onepanelServiceType) {
      case 'oneprovider':
        promise = this.get('providerManager').getProviderDetails()
          .then(provider => provider && get(provider, 'domain'));
        break;
      case 'onezone':
        promise = this.get('deploymentManager').getConfiguration()
          .then(({ data: cluster }) => cluster && get(cluster, 'onezone.domainName'));
        break;
      default:
        throw new Error(`Invalid onepanelServiceType: ${onepanelServiceType}`);
    }
    return PromiseObject.create({ promise });
  }),

  configureWebCertPoll: observer('shouldPollWebCert', function configureWebCertPoll() {
    const {
      shouldPollWebCert,
      webCertPollLooper,
    } = this.getProperties('shouldPollWebCert', 'webCertPollLooper');
    if (shouldPollWebCert) {
      if (!webCertPollLooper) {
        const newWebCertPollLooper = this.set('webCertPollLooper', Looper.create({
          interval: webCertPollInterval,
          immediate: true,
        }));
        newWebCertPollLooper.on('tick', this.updateWebCertProxy.bind(this));
      }
    } else {
      if (webCertPollLooper) {
        webCertPollLooper.destroy();
      }
    }
  }),

  init() {
    this._super(...arguments);
    this.updateWebCertProxy();
  },

  /**
   * Alias for testing puproses
   * Using the same parameters as `util:changeDomain`
   * @returns {Promise} resolves after setting window.location
   */
  _changeDomain() {
    return changeDomain(...arguments);
  },

  /**
   * Creates new promise object for `webCertProxy` property
   */
  updateWebCertProxy() {
    const proxy = PromiseObject.create({
      promise: this.get('webCertManager')
        .fetchWebCert(),
    });
    safeExec(this, 'set', 'webCertProxy', proxy);
  },

  actions: {
    /**
     * @param {Onepanel.WebCert} webCertChange
     * @returns {Promise} promise with modify web cert request result
     */
    submitModify(webCertChange) {
      return this.get('webCertManager').modifyWebCert(webCertChange)
        .then(() => {
          const thisWebCert = this.get('webCert');
          safeExec(this, () => {
            setProperties(
              thisWebCert,
              webCertChange,
            );
          });
        })
        .finally(this.updateWebCertProxy.bind(this))
        .then(() => safeExec(this, 'set', '_editing', false));
    },

    toggleModifyWebCert() {
      this.toggleProperty('_editing');
    },

    /**
     * @returns {Promise} resolves when modify web cert is successful
     */
    refreshCert() {
      const regeneratePromise = this.actions.submitModify.bind(this)({
        letsEncrypt: true,
      });
      regeneratePromise.then(this.actions.changeDomain.bind(this));
      regeneratePromise.catch(error => {
        this.get('globalNotify').backendError(
          this.t('renewingWebCert'),
          error
        );
      });
      this.set('regenerateProxy', PromiseObject.create({ promise: regeneratePromise }));
      return regeneratePromise;
    },

    changeDomain() {
      this.set('showRedirectPage', true);
      this.get('redirectDomain')
        .then(domain => changeDomain(
          domain, {
            delay: redirectDomainDelay,
          }
        ))
        .catch(() => safeExec(this, 'set', 'showRedirectPage', false));
    },
  },
});
