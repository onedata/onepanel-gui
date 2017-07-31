/**
 * A component used by one-tree. It represents tree item content. Example of 
 * usage can be found in one-tree component comments.
 * 
 * Can be used only as a contextual component yielded by one-tree-item.
 * 
 * @module components/one-tree-item-content
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import { invokeAction } from 'ember-invoke-action';

export default Ember.Component.extend({
  classNames: ['one-tree-item-content'],
  
  click() {
    invokeAction(this, '_showAction');
  }
});
