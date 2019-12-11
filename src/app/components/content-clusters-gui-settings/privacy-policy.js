/**
 * Extended version of GuiMessageEditorBase component that allows to modify
 * privacy policy. It allows only to input text with HTML tags (using WYSIWIG editor).
 * 
 * @module components/content-clusters-gui-settings/privacy-policy
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import GuiMessageEditorBase from 'onepanel-gui/components/content-clusters-gui-settings/gui-message-editor-base';
import { reads } from '@ember/object/computed';

export default GuiMessageEditorBase.extend(I18n, {
  classNames: ['privacy-policy'],

  i18n: service(),
  guiSettingsActions: service(),
  guiSettingsManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentClustersGuiSettings.tabs.privacyPolicy',

  /**
   * @override
   */
  savedMessageProxy: reads('guiSettingsManager.privacyPolicyProxy'),

  /**
   * @override
   */
  save(message) {
    return this.get('guiSettingsActions').savePrivacyPolicy(message);
  },
});
