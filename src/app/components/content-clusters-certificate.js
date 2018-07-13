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
import { default as EmberObject, computed, setProperties, observer } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import GlobalActions from 'onedata-gui-common/mixins/components/global-actions';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import Looper from 'onedata-gui-common/utils/looper';
import changeDomain from 'onepanel-gui/utils/change-domain';
import config from 'ember-get-config';

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
    'webCert.status',
    'regeneratePending',
    function shouldPollWebCert() {
      return this.get('webCert.status') === 'regenerating' ||
        this.get('regeneratePending');
    }
  ),

  /**
   * @override 
   * @type {Ember.ComputedProperty<Array<Action>>}
   */
  globalActions: computed(
    '_toggleModifyWebCertAction',
    function getGlobalActions() {
      return [this.get('_toggleModifyWebCertAction')];
    }
  ),

  /**
   * @type {EmberObject<Onepanel.WebCert>}
   */
  webCert: computed('webCertProxy.content', function webCert() {
    return EmberObject.create(this.get('webCertProxy.content'));
  }),

  _formTitle: computed(function _formTitle() {
    return this.t('formTitleStatic');
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

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  _toggleModifyWebCertAction: computed('_editing', function _toggleModifyWebCertAction() {
    const _editing = this.get('_editing');
    return {
      action: () => this.send('toggleModifyWebCert'),
      title: this.t(_editing ? 'cancelModifying' : 'modifyWebCertDetails'),
      class: 'btn-modify-web-cert',
      buttonStyle: _editing ? 'default' : 'primary',
    };
  }),

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
        .getWebCert(),
    });
    safeExec(this, 'set', 'webCertProxy', proxy);
  },

  init() {
    this._super(...arguments);
    this.updateWebCertProxy();
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
        .then(this.updateWebCertProxy.bind(this))
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
      this.set('regenerateProxy', PromiseObject.create({ promise: regeneratePromise }));
      return regeneratePromise;
    },

    changeDomain(domain) {
      this.set('showRedirectPage', true);
      return changeDomain(domain, {
        delay: redirectDomainDelay,
      }).catch(() => safeExec(this, 'set', 'showRedirectPage', false));
    },
  },
});
