/**
 * @module router
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL,

  redirects: {
    wildcard: 'login'
  }
});

Router.map(function () {
  this.route('onedata', function () {
    this.route('sidebar', { path: ':type' }, function () {
      this.route('content', { path: ':resourceId' }, function () {
        this.route('aspect', { path: ':aspectId' });
      });
    });
  });
  this.route('login');
  this.route('wildcard', { path: "*path" });
});

export default Router;
