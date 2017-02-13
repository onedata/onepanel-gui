import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('onedata', function() {
    this.route('spaces');
    this.route('resources');
  });
});

export default Router;
