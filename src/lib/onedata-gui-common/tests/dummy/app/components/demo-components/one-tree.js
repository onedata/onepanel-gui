/**
 * @module components/demo-components/one-tree
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

export default Ember.Component.extend({
  treeDefinition: [{
      content: 'Node 1',
      subtree: [{
        content: 'Node 1.1',
        subtree: [{
          content: 'Node 1.1.1',
          subtree: [],
        }, {
          content: 'Node 1.1.2',
          subtree: [],
        }, {
          content: 'Node 1.1.3',
          subtree: [],
        }, {
          content: 'Node 1.1.4',
          subtree: [],
        }]
      }, {
        content: 'Node 1.2',
        subtree: [{
          content: 'Node 1.2.1',
          subtree: [],
        }, {
          content: 'Node 1.2.2',
          subtree: [],
        }, {
          content: 'Node 1.2.3',
          subtree: [],
        }, {
          content: 'Node 1.2.4',
          subtree: [],
        }]
      }]
    },
    {
      content: 'Node 2',
      subtree: [{
        content: 'Node 2.1',
        subtree: [{
          content: 'Node 2.1.1',
          subtree: [],
        }, {
          content: 'Node 2.1.2',
          subtree: [],
        }, {
          content: 'Node 2.1.3',
          subtree: [],
        }, {
          content: 'Node 2.1.4',
          subtree: [],
        }]
      }, {
        content: 'Node 2.2',
        subtree: [{
          content: 'Node 2.2.1',
          subtree: [],
        }, {
          content: 'Node 2.2.2',
          subtree: [],
        }, {
          content: 'Node 2.2.3',
          subtree: [],
        }, {
          content: 'Node 2.2.4',
          subtree: [],
        }]
      }]
    }
  ],

  _searchQuery: '',

  actions: {
    search(query) {
      this.set('_searchQuery', query);
    }
  }
});