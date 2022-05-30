/**
 * Base component for GUI message editors. To be fully functional:
 *   - `savedMessageProxy`, `save()` must be overridden
 *   - template must be provided.
 *
 * @module components/content-clusters-gui-settings/gui-message-editor-base
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { or, notEqual } from 'ember-awesome-macros';
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';

export default Component.extend({
  guiSettingsManager: service(),

  /**
   * @type {boolean}
   */
  isEnabled: true,

  /**
   * Contains GUI message content visible in editor.
   * @type {string}
   */
  body: '',

  /**
   * @type {PromiseProxy<GuiMessage>}
   */
  savedMessageProxy: undefined,

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isModified: or(
    notEqual('isEnabled', 'savedMessageProxy.content.enabled'),
    notEqual('body', 'savedMessageProxy.content.body')
  ),

  /**
   * @type {boolean}
   */
  isSaving: false,

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isGuiMessageBodyEmpty: computed('body', function isGuiMessageBodyEmpty() {
    const {
      guiSettingsManager,
      body,
    } = this.getProperties('guiSettingsManager', 'body');
    return guiSettingsManager.isGuiMessageBodyEmpty(body);
  }),

  init() {
    this._super(...arguments);

    this.fillWithSavedMessageContent();
  },

  /**
   * @returns {undefined}
   */
  fillWithSavedMessageContent() {
    this.get('savedMessageProxy')
      .then(({ enabled, body }) => safeExec(this, () => {
        this.setProperties({
          isEnabled: enabled,
          body,
        });
      }));
  },

  /**
   * To implement
   * @virtual
   * @returns {Promise}
   */
  save() {
    return notImplementedReject();
  },

  actions: {
    isEnabledChanged(isEnabled) {
      this.set('isEnabled', isEnabled);
    },
    bodyChanged(body) {
      this.set('body', body);
    },
    save() {
      const {
        isEnabled,
        body,
      } = this.getProperties(
        'isEnabled',
        'body',
      );

      const message = {
        enabled: isEnabled,
        body,
      };

      return this.save(message).then(() => this.fillWithSavedMessageContent());
    },
  },
});
