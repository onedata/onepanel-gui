/**
 * Extended version of GuiMessageEditorBase component that allows to modify
 * Terms of Use. It allows only to input text with HTML tags (using WYSIWIG editor).
 * 
 * @module components/content-clusters-gui-settings/terms-of-use
 * @author Agnieszka Warchoł
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import GuiMessageEditorBase from 'onepanel-gui/components/content-clusters-gui-settings/gui-message-editor-base';
import { reads } from '@ember/object/computed';
import { computed } from '@ember/object';

export default GuiMessageEditorBase.extend(I18n, {
  classNames: ['terms-of-use'],

  i18n: service(),
  guiSettingsActions: service(),
  guiSettingsManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentClustersGuiSettings.tabs.termsOfUse',

  /**
   * @override
   */
  savedMessageProxy: reads('guiSettingsManager.termsOfUseProxy'),

  /**
   * @override
   */
  save(message) {
    return this.get('guiSettingsActions').saveTermsOfUse(message);
  },

  isBodyEmpty: computed('body', function isBodyEmpty() {
    const {
      guiSettingsManager,
      body,
    } = this.getProperties('guiSettingsManager', 'body');
    return guiSettingsManager.isBodyEmpty(body);
  }),
});
