import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

export default Component.extend(
  I18n,
  createDataProxyMixin('savedSignInNotification'), {
    classNames: ['gui-settings-sign-in-notification'],

    i18n: service(),
    guiSettingsActions: service(),

    /**
     * @override
     */
    i18nPrefix: 'components.contentClustersGuiSettings.tabs.signInNotification',

    /**
     * Contains sing-in notification text visible in textarea.
     * @type {string}
     */
    signInNotification: '',

    /**
     * @type {boolean}
     */
    isSaving: false,

    init() {
      this._super(...arguments);

      this.get('savedSignInNotificationProxy')
        .then(text => safeExec(this, () => this.set('signInNotification', text)));
    },

    /**
     * @override
     */
    fetchSavedSignInNotification() {
      return this.get('guiSettingsActions').getSignInNotification();
    },

    actions: {
      notificationChanged(text) {
        this.set('signInNotification', text);
      },
      save() {
        const {
          guiSettingsActions,
          signInNotification,
        } = this.getProperties('guiSettingsActions', 'signInNotification');
        return guiSettingsActions.saveSignInNotification(signInNotification);
      },
    },
  }
);
