import Ember from 'ember';

// FIXME
const Onepanel = {};
// import Onepanel from 'npm:onepanel';
import moment from 'npm:moment';

const ObjectPromiseProxy = Ember.ObjectProxy.extend(Ember.PromiseProxyMixin);

function replaceUrlOrigin(url, newOrigin) {
  return url.replace(/https?:\/\/.*?(\/.*)/, newOrigin + '$1');
}

// ONLY FOR DEVELOPMENT TESTS
// const basicAuthEncoded = window.btoa(`${USERNAME}:${PASSWORD}`);
// api.defaultHeaders['Authentication'] = 'Authorization: Basic ' + basicAuthEncoded;

const {
  RSVP: {
    Promise
  },
  inject: {
    service
  },
  computed,
  computed: {
    readOnly
  }
} = Ember;

// TODO: set client to null if forbidden error

function validateCookies(cookieValues) {
  let date = cookieValues['lastUpdate'];
  // TODO check how long
  return date && moment(date).isValid() && !!cookieValues['username'] && !!cookieValues['password'];
}

export default Ember.Service.extend({
  cookies: service(),

  /**
   * @type {Onepanel.OnepanelApi}
   */
  client: null,
  
  /**
   * @type {ObjectPromiseProxy}
   */
  cookiesReader: null,

  isLoading: readOnly('cookiesReader.isPending'),

  /**
   * @type {computed<Boolean>}
   */
  isInitialized: computed('client', function () {
    return this.get('client') != null;
  }),

  init() {
    this._super(...arguments);
    let readingCookies = this.readCookies();
    this.set('cookiesReader', ObjectPromiseProxy.create({
      promise: readingCookies
    }));
  },

  /**
   * @returns {Promise}
   */
  readCookies() {
    let cookies = this.get('cookies');
    let cookieValues = cookies.read();
    return new Promise((resolve, reject) => {
      if (validateCookies(cookieValues)) {
        let username = cookieValues['username'];
        let password = cookieValues['password'];
        let testingAuth = this.requestTestAuth(username, password);
        testingAuth.then(() => {
          this.initializeClient(username, password);
          resolve();
        });
        testingAuth.catch(reject);
      } else {
        reject();
      }
    });
  },

  writeCookies() {
    let {
      cookies,
      username,
      password
    } = this.getProperties(
      'cookies',
      'username',
      'password'
    );
    cookies.write('lastUpdate', new Date());
    cookies.write('username', username);
    cookies.write('password', password);
  },

  createClient(username, password, origin = null) {
    let api = new Onepanel.OnepanelApi();
    api.apiClient.authentications['basic']['username'] = username;
    api.apiClient.authentications['basic']['password'] = password;
    api.apiClient.basePath = replaceUrlOrigin(api.apiClient.basePath, origin || window.location.origin);
    return api;
  },

  initializeClient(username, password, origin) {
    let client = this.createClient(username, password, origin);
    this.set('client', client);
    this.writeCookies();
  },

  request(methodName, params = {}) {
    let client = this.get('client');
    let method = client[methodName];
    if (method) {
      method = method.bind(client);
    } else {
      throw new Error('service:onepanel-server: API client has no method: ' + methodName);
    }
    return new Promise((resolve, reject) => {
      method(params, function (error, data, response) {
        if (error) {
          console.error(`service:onepanel-server: request error: ${JSON.stringify(error)}`);
          if (response.forbidden === true) {
            console.error('service:onepanel-server: the request is forbidden');
          }
          reject(error);
        } else {
          resolve(data);
        }
      });
    });
  },

  requestTestAuth(username, password, origin) {
    return new Promise((resolve, reject) => {
      this.createClient(username, password, origin).getClusterCookie(function (error) {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

});
