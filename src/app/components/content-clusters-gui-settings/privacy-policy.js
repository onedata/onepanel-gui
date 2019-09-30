import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import GuiMessageEditorBase from 'onepanel-gui/components/content-clusters-gui-settings/gui-message-editor-base';
import { reads } from '@ember/object/computed';

export default GuiMessageEditorBase.extend(I18n, {
  classNames: ['gui-settings-privacy-policy'],

  i18n: service(),
  guiSettingsActions: service(),
  guiSettingsManager: service(),

  /**
   * @override
   */
  savedMessageProxy: reads('guiSettingsManager.privacyPolicyProxy'),

  /**
   * @override
   */
  i18nPrefix: 'components.contentClustersGuiSettings.tabs.privacyPolicy',

  /**
   * @override
   */
  save(message) {
    return this.get('guiSettingsActions').setPrivacyPolicy(message);
  },
});
