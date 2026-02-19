/**
 * Storage property shown in storages table
 *
 * Please put it in ``cluster-storage-table``.
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */
import Component from '@ember/component';
import { computed, trySet } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/i18n';
import _ from 'lodash';
import config from 'ember-get-config';
import $ from 'jquery';
import globals from 'onedata-gui-common/utils/globals';
import { serializeAspectOptions } from 'onedata-gui-common/services/navigation-state';

const {
  layoutConfig,
} = config;

export default Component.extend(I18n, {
  classNames: ['storage-item'],
  classNameBindings: ['whileEdition:in-edit-mode'],

  storageManager: service(),
  storageActionsService: service('storageActions'),
  globalNotify: service(),
  i18n: service(),
  router: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.storageItem',

  /**
   * @virtual
   * @type {OneCollapsibleListItem}
   */
  listItem: null,

  /**
   * @virtual
   * @type {ObjectProxy<Onepanel.StorageDetails>}
   */
  storageProxy: null,

  /**
   * @type {boolean}
   */
  isSupportButtonHidden: false,

  /**
   * @type {() => void}
   */
  reloadStoragesList: null,

  /**
   * @type {Onepanel.StorageDetails|null}
   */
  storage: reads('storageProxy.content'),

  /**
   * If true, storage edit form is visible
   */
  whileEdition: false,

  /**
   * @type {Array<ObjectProxy<OnepanelGui.SpaceDetails>>}
   */
  spaces: undefined,

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  storageId: reads('storage.id'),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  hasSupportedSpaces: computed(
    'spaces.@each.isFulfilled',
    'storageId',
    function hasSupportedSpaces() {
      const {
        spaces,
        storageId,
      } = this.getProperties('spaces', 'storageId');
      return !!spaces.findBy('storageId', storageId);
    }
  ),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isImportedAndUsed: computed(
    'storage.importedStorage',
    'hasSupportedSpaces',
    function isImportedAndUsed() {
      return this.storage?.importedStorage && this.hasSupportedSpaces;
    }),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  showSpacesSupport: reads('hasSupportedSpaces'),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  modifyStorageAction: computed('whileEdition', function modifyStorageAction() {
    const whileEdition = this.get('whileEdition');
    return {
      action: () => this.toggleEdition(),
      title: this.t(
        whileEdition ? 'cancelStorageModification' : 'modifyStorageDetails'
      ),
      class: 'modify-storage-details hidden-lg hidden-md hidden-sm',
      icon: 'browser-rename',
    };
  }),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  addSupportSpaceAction: computed(
    'isSupportButtonHidden',
    'isImportedAndUsed',
    function addSupportSpaceAction() {
      return {
        action: () => this.supportSpace(),
        title: this.t('supportSpace'),
        class: 'support-space hidden-lg hidden-md hidden-sm',
        icon: 'space',
        disabled: this.isSupportButtonHidden || this.isImportedAndUsed,
      };
    }
  ),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  removeStorageAction: computed('hasSupportedSpaces', function () {
    const hasSupportedSpaces = this.get('hasSupportedSpaces');
    return {
      action: () => this.get('removeStorage')(),
      title: this.t('removeStorage'),
      class: 'remove-storage',
      icon: 'close',
      disabled: hasSupportedSpaces,
    };
  }),

  /**
   * @type {Ember.ComputedProperty<Array<Action>>}
   */
  storageActions: computed('isSupportButtonHidden', function storageActions() {
    const actions = [this.modifyStorageAction, this.removeStorageAction];
    if (!this.isSupportButtonHidden) {
      actions.push(this.addSupportSpaceAction);
    }
    return actions;
  }),

  /**
   * @type {Ember.ComputedProperty<Object>}
   */
  formLayoutConfig: computed('whileEdition', function formLayoutConfig() {
    const whileEdition = this.get('whileEdition');
    const config = _.assign({}, layoutConfig);
    if (whileEdition) {
      _.assign(config, {
        formLabelColumns: 'col-xs-12 col-sm-4 text-left',
        formInputColumns: 'col-xs-12 col-sm-8',
        formToggleLabelColumns: 'col-xs-9 col-sm-4 text-left',
        formToggleInputColumns: 'col-xs-3 col-sm-8 text-xs-right',
        formSubmitColumns: 'col-xs-12 col-sm-8 col-sm-offset-4 text-xs-center',
      });
    }
    return config;
  }),

  /**
   * @override
   */
  init() {
    this._super(...arguments);
    if (!this.spaces) {
      this.set('spaces', []);
    }
  },

  /**
   * Starts/stops storage edition. Expands list item if necessary
   * @returns {undefined}
   */
  toggleEdition() {
    this.toggleProperty('whileEdition');
    if (this.get('whileEdition')) {
      this.get('listItem.toggle')(true);
    }
  },

  supportSpace() {
    this.router.transitionTo('onedata.sidebar.content.aspect', 'spaces', {
      queryParams: {
        options: serializeAspectOptions({
          isFormOpened: true,
          storageId: this.storageId,
        }),
      },
    });
  },

  actions: {
    turnOnModifyStorage() {
      if (!this.get('whileEdition')) {
        this.toggleEdition();
      }
    },
    supportSpace() {
      this.supportSpace();
    },
    async saveEdition(storageFormData) {
      const action = this.storageActionsService.createSaveStorageModificationAction({
        storageId: this.storageId,
        modifiedStorageOptions: storageFormData,
      });
      const result = await action.execute();

      if (result.status === 'done') {
        trySet(this, 'whileEdition', false);
        this.reloadStoragesList(this.storageId);
      }
    },
    cancelEdition() {
      this.set('whileEdition', false);
    },
    selectText(event) {
      let element;
      const eventTarget = $(event.target);
      if (eventTarget.hasClass('form-control-static') ||
        eventTarget.hasClass('qos-param-value')) {
        element = eventTarget[0];
      } else if (eventTarget.hasClass('nested-row')) {
        element = eventTarget.find('.one-label.qos-param-value')[0];
      } else {
        element = eventTarget.find('.form-control-static')[0];
      }

      if (element) {
        const selection = globals.window.getSelection();
        const range = globals.document.createRange();
        range.selectNodeContents(element);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    },
  },
});
