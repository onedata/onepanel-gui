import Ember from 'ember';

import Onepanel from "npm:onepanel";

// TODO: this all should be computed dynamically based on cookie

const api = new Onepanel.OnepanelApi();

const USERNAME = 'admin';
const PASSWORD = 'password';

const basicAuthEncoded = window.btoa(`${USERNAME}:${PASSWORD}`);

api.defaultHeaders['Authentication'] = 'Authorization: Basic ' + basicAuthEncoded;

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};

export default Ember.Component.extend({
  didInsertElement() {
    this._super(...arguments);
    api.getClusterHosts({
      discovered: true
    }, callback);
  }
});
