import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import GuiMessageEditorBase from 'onepanel-gui/components/content-clusters-gui-settings/gui-message-editor-base';
import { reads } from '@ember/object/computed';

export default GuiMessageEditorBase.extend(I18n, {
  classNames: ['gui-settings-sign-in-notification'],

  i18n: service(),
  guiSettingsActions: service(),
  guiSettingsManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentClustersGuiSettings.tabs.signInNotification',

    /**
   * @override
   */
  savedMessageProxy: reads('guiSettingsManager.signInNotificationProxy'),

  /**
   * @override
   */
  save(message) {
    return this.get('guiSettingsActions').setSignInNotification(message);
  },
});
