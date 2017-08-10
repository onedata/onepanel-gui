import Ember from 'ember';

const {
  computed: {
    sort,
  },
  inject: {
    service,
  },
} = Ember;

export default Ember.Component.extend({
  globalNotify: service(),

  /**
   * Spaces list sort order
   * @type {Array.string}
   */
  _spacesSorting: ['isDefault:desc', 'name'],

  /**
   * Sorted array of spaces
   * @type {Array.Onezone.SpaceDetails}
   */
  _spacesSorted: sort('provider.spaces', '_spacesSorting'),

  actions: {
    copySuccess() {
      let {
        i18n,
        globalNotify
      } = this.getProperties('i18n', 'globalNotify');

      globalNotify.info(i18n.t('components.providerPlace.drop.hostnameCopySuccess'));
    },

    copyError() {
      let {
        i18n,
        globalNotify
      } = this.getProperties('i18n', 'globalNotify');

      globalNotify.info(i18n.t('components.providerPlace.drop.hostnameCopyError'));
    }
  }
});
