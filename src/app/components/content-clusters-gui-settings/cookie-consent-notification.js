import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import insertTextAtCursor from 'npm:insert-text-at-cursor';
import { next } from '@ember/runloop';
import { reads } from '@ember/object/computed';
import GuiMessageEditorBase from 'onepanel-gui/components/content-clusters-gui-settings/gui-message-editor-base';

export default GuiMessageEditorBase.extend(I18n, {
  classNames: ['gui-settings-cookie-consent-notification'],

  i18n: service(),
  guiSettingsActions: service(),
  guiSettingsManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentClustersGuiSettings.tabs.cookieConsentNotification',

  /**
   * @override
   */
  savedMessageProxy: reads('guiSettingsManager.cookieConsentNotificationProxy'),

  /**
   * @type {HTMLTextAreaElement}
   */
  textareaElement: undefined,

  didInsertElement() {
    this._super(...arguments);

    this.get('savedMessageProxy').then(() => next(() => safeExec(this, () => {
      this.set(
        'textareaElement',
        this.get('element').querySelector('.cookie-consent-notification-input')
      );
    })));
  },

  /**
   * @override
   */
  save(message) {
    return this.get('guiSettingsActions').setCookieConsentNotification(message);
  },

  actions: {
    insertPrivacyPolicyLink() {
      const text = `[privacy-policy]${this.t('privacyPolicy')}[/privacy-policy]`;
      insertTextAtCursor(this.get('textareaElement'), text);
    },
  },
});
