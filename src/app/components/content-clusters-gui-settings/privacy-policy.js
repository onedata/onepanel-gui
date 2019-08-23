import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

export default Component.extend(
  I18n,
  createDataProxyMixin('savedPrivacyPolicy'), {
    classNames: ['gui-settings-privacy-policy'],

    i18n: service(),
    guiSettingsActions: service(),

    /**
     * @override
     */
    i18nPrefix: 'components.contentClustersGuiSettings.tabs.privacyPolicy',

    /**
     * Contains privacy policy content visible in editor.
     * @type {string}
     */
    privacyPolicy: '',

    /**
     * @type {boolean}
     */
    isSaving: false,

    init() {
      this._super(...arguments);

      this.get('savedPrivacyPolicyProxy')
        .then(content => safeExec(this, () => this.set('privacyPolicy', content)));
    },

    /**
     * @override
     */
    fetchSavedPrivacyPolicy() {
      return this.get('guiSettingsActions').getPrivacyPolicy();
    },

    actions: {
      privacyPolicyChanged(content) {
        this.set('privacyPolicy', content);
      },
      save() {
        const {
          guiSettingsActions,
          privacyPolicy,
        } = this.getProperties('guiSettingsActions', 'privacyPolicy');
        return guiSettingsActions.savePrivacyPolicy(privacyPolicy);
      },
    },
  }
);
