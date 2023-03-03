/**
 * Extended version of GuiMessageEditorBase component that allows to modify
 * sign-in notification. It allows only to input text without HTML tags.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import GuiMessageEditorBase from 'onepanel-gui/components/content-clusters-gui-settings/gui-message-editor-base';
import { reads } from '@ember/object/computed';

export default GuiMessageEditorBase.extend(I18n, {
  classNames: ['sign-in-notification'],

  i18n: service(),
  guiSettingsActions: service(),

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
    return this.get('guiSettingsActions').saveSignInNotification(message);
  },
});
