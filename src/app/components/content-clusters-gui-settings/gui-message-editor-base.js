import Component from '@ember/component';
import { set } from '@ember/object';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { or, notEqual } from 'ember-awesome-macros';
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';

export default Component.extend({
  /**
   * @type {boolean}
   */
  isEnabled: true,

  /**
   * Contains privacy policy content visible in editor.
   * @type {string}
   */
  content: '',

  /**
   * @type {PromiseProxy<GuiMessage>}
   */
  savedMessageProxy: undefined,

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isModified: or(
    notEqual('isEnabled', 'savedMessageProxy.content.enabled'),
    notEqual('content', 'savedMessageProxy.content.content')
  ),

  /**
   * @type {boolean}
   */
  isSaving: false,

  init() {
    this._super(...arguments);

    this.get('savedMessageProxy')
      .then(({ enabled, content }) => safeExec(this, () => this.setProperties({
        isEnabled: enabled,
        content,
      })));
  },

  /**
   * To implement
   * @abstract
   * @returns {Promise}
   */
  save() {
    return notImplementedReject();
  },

  actions: {
    isEnabledChanged(isEnabled) {
      this.set('isEnabled', isEnabled);
    },
    contentChanged(content) {
      this.set('content', content);
    },
    save() {
      const {
        isEnabled,
        content,
        savedMessageProxy,
      } = this.getProperties(
        'isEnabled',
        'content',
        'savedMessageProxy'
      );
      
      const message = {
        enabled: isEnabled,
        content,
      };
      
      return this.save(message).then(() =>
        safeExec(this, () => set(savedMessageProxy, 'content', message))
      );
    },
  },
});
