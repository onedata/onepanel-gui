/**
 * A component that displays content using nested lists - tree view. 
 * Yields item components, which yields content and subtree components.
 * 
 * Subtree visibility can be turned on/off by item content click or by 
 * eventsBus events. To use eventsBus, key must by defined for both the one-tree 
 * component and an item, which subtree we want to expand/collapse.
 * 
 * eventsBus.trigger needs arguments:
 * 'oneTreeShow' - event name,
 * oneTreeKey - key of the one-tree component
 * itemKey - key of the item to expand/collapse
 * subtreeVisibility - status of expand/collapse. May be true, false or
 *   undefined. The last one means that each event trigger will toggle
 *   item subtree visibility
 * 
 * Example: If one-tree has key property set to "rootTree", and one 
 * of the items has key "treeItem4", then treeItem4 can be expanded by:
 * ```
 * {{#one-tree key="rootTree" as |tree|}}
 *   {{#tree.item key="treeItem4" as |item|}}
 *     {{#item.content}}item header{{/item.content}}
 *     {{#item.subtree as |subtree|}
 *       {{#subtree.item as |subitem|}}
 *         {{#subitem.content}}subitem header{{/subitem.content}}
 *       {{/subtree.item}}
 *     {{/item.subtree}}
 *   {{/tree.item}}
 * {{/one-tree}}
 * 
 * ...
 * 
 * eventsBus.trigger('oneTreeShow', 'rootTree', 'treeItem4', true);
 * ```
 * 
 * By default collapse of the parent subtree will automatically collapse
 * every nested subtrees. This behavior can be changed by setting
 * collapseRecursively property to false. After that, visibility state of nested
 * subtrees will be remembered between parent subtree expand/collapse cycles.
 * 
 * Note: keys used to identify tree components and items do not have to be strings.
 * Every value, that is not recognised as an empty value in JS, is good.
 *
 * @module components/one-tree
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import { invokeAction } from 'ember-invoke-action';

const {
  computed: {
    oneWay,
    empty,
  },
} = Ember;

export default Ember.Component.extend({
  classNames: ['one-tree', 'collapse-animation', 'collapse-small'],
  classNameBindings: ['_isRoot:one-tree-root', '_isExpanded::collapse-hidden'],

  /**
   * Key for this tree, used to determine at the root level if it 
   * should be visible. Also used as an identifier for root tree while
   * handling eventsBus events. By user can be set only on root tree element
   * or item element.
   * @type {*}
   */
  key: oneWay('elementId'),

  /**
   * If true, then if parent tree collapse, this tree will collapse.
   * @type {boolean}
   */
  collapseRecursively: true,

  /**
   * Key for root tree. When tree is a root tree, then _rootKey = null.
   * @type {*}
   */
  _rootKey: null,

  /**
   * Parent tree show action.
   * @type {Function}
   */
  _showAction: null,

  /**
   * Array of visible subtree keys. Keys must be uniqe at the root tree level 
   * and can be of any type. Used by all trees, modified only by root. 
   * Injected by root tree through parent trees.
   * @type {Array.*}
   */
  _activeSubtreeKeys: [],

  /**
   * If true, all parent trees are expanded and visible to user. 
   * Property injected by parent tree.
   * @type {boolean}
   */
  _areParentsExpanded: true,

  /**
   * If true, tree will be expanded (but it can be still invisible, because some 
   * of parent trees may be collapsed). Used only by non-root tree. Root tree 
   * is always expanded.
   * @type {boolean}
   */
  _isExpanded: true,

  /**
   * If true, this component is a top level tree component (has no parent tree).
   * @type {boolean}
   */
  _isRoot: empty('_rootKey'),

  didInsertElement() {
    this._super(...arguments);

    invokeAction(this, '_hasTreeNotify', true);
  },

  willDestroyElement() {
    this._super(...arguments);

    invokeAction(this, '_hasTreeNotify', false);
  },


  actions: {
    /**
     * Expands/collapses specified subtrees.
     * @param {Array.*} subtreeKeys subtree keys
     * @param {boolean} subtreeIsExpanded visibility state. If not provided, 
     * action will toggle subtree visibility
     */
    show(subtreeKeys, subtreeIsExpanded) {
      let {
        _isRoot,
        _activeSubtreeKeys,
      } = this.getProperties('_isRoot', '_activeSubtreeKeys');
     
      if (_isRoot) {
        let newActiveSubtreeKeys = _activeSubtreeKeys.filter(k => subtreeKeys.indexOf(k) === -1);
        if (subtreeIsExpanded === undefined) {
          subtreeIsExpanded = newActiveSubtreeKeys.length + subtreeKeys.length > _activeSubtreeKeys.length;
        }
        this.set('_activeSubtreeKeys', subtreeIsExpanded ?
          _activeSubtreeKeys.concat(subtreeKeys) : newActiveSubtreeKeys);
      } else {
        invokeAction(this, '_showAction', subtreeKeys, subtreeIsExpanded);
      }
    }
  }
});
