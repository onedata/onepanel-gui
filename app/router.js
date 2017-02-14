import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('onedata', function() {
    this.route('resources', { path: ':resources' }, function() {
      this.route('content', { path: ':resourceId' });
    });
    this.route('providers');
  });
});

export default Router;
