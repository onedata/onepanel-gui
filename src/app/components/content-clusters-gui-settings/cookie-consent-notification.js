/**
 * Extended version of GuiMessageEditorBase component that allows to modify
 * cookie consent notification. It allows only to input text, bbcode-like tag
 * ([privacy-policy]) and no HTML.
 * 
 * @module components/content-clusters-gui-settings/cookie-consent-notification
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import insertTextAtCursor from 'npm:insert-text-at-cursor';
import { next } from '@ember/runloop';
import { reads } from '@ember/object/computed';
import GuiMessageEditorBase from 'onepanel-gui/components/content-clusters-gui-settings/gui-message-editor-base';

export default GuiMessageEditorBase.extend(I18n, {
  classNames: ['cookie-consent-notification'],

  i18n: service(),
  guiSettingsActions: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentClustersGuiSettings.tabs.cookieConsentNotification',

  /**
   * @override
   */
  savedMessageProxy: reads('guiSettingsManager.cookieConsentNotificationProxy'),

  /**
   * Editor element
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
    return this.get('guiSettingsActions').saveCookieConsentNotification(message);
  },

  actions: {
    insertPrivacyPolicyLink() {
      const text = `[privacy-policy]${this.t('privacyPolicy')}[/privacy-policy]`;
      insertTextAtCursor(this.get('textareaElement'), text);
    },
    insertTermsOfUseLink() {
      const text = `[terms-of-use]${this.t('termsOfUse')}[/terms-of-use]`;
      insertTextAtCursor(this.get('textareaElement'), text);
    },
  },
});
