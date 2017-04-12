import Ember from 'ember';
import UserDetails from 'onepanel-gui/models/user-details';

const {
  Service,
  inject: { service },
  RSVP: { Promise },
  ObjectProxy,
  PromiseProxyMixin,
  A,
  computed: { oneWay },
} = Ember;

const ObjectPromiseProxy = ObjectProxy.extend(PromiseProxyMixin);

export default Service.extend({
  onepanelServer: service(),
  username: oneWay('onepanelServer.username'),

  getCurrentUser() {
    return this.getUserDetails(this.get('username'));
  },

  getUserDetails(username) {
    let user = this.get('onepanelServer')
      .request('onepanel', 'getUser', username)
      .then(({ data }) => UserDetails.create({
        username: username,
        userId: data.userId,
        userRole: data.userRole,
      }));
    return ObjectPromiseProxy.create({ promise: user });
  },

  getUsers() {
    let promise = new Promise(resolve => {
      resolve(A([this.getCurrentUser()]));
    });
    return ObjectPromiseProxy.create({ promise });
  },
});
