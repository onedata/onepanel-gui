import Ember from 'ember';

import Onepanel from 'npm:onepanel';
import moment from 'npm:moment';

const ObjectPromiseProxy = Ember.ObjectProxy.extend(Ember.PromiseProxyMixin);

function replaceUrlOrigin(url, newOrigin) {
  return url.replace(/https?:\/\/.*?(\/.*)/, newOrigin + '$1');
}

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

  username: null,
  password: null,

  isLoading: readOnly('cookiesReader.isPending'),

  /**
   * @type {computed<Boolean>}
   */
  isInitialized: computed('client', function () {
    return this.get('client') != null;
  }),
  
  /// APIs provided by onepanel client library
  
  request(api, method, ...params) {
    // TODO protect property read
    return new Promise((resolve, reject) => {
      let callback = (error, data, response) => {
        if (error) {
          reject(error);
        } else {
          resolve({ data, response });
        }
      };
      this.get(api + 'Api')[method](...params, callback);
    });
  },

  // TODO FIXME DO NOT USE THESE!!! use request method instead

  onepanelApi: computed('client', function() {
    let client = this.get('client');
    return client ? new Onepanel.OnepanelApi(client) : null;
  }).readOnly(),

  onezoneApi: computed('client', function() {
    let client = this.get('client');
    return client ? new Onepanel.OnezoneApi(client) : null;
  }).readOnly(),
  
  oneproviderApi: computed('client', function() {
    let client = this.get('client');
    return client ? new Onepanel.OneproviderApi(client) : null;
  }).readOnly(),

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
          this.initClient(username, password);
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
    let client = new Onepanel.ApiClient();
    let basic = client.authentications['basic'];
    basic['username'] = username;
    basic['password'] = password;
    this.setProperties({
      username,
      password
    });
    client.basePath = replaceUrlOrigin(client.basePath, origin || window.location.origin);
    return client;
  },

  initClient(username, password, origin) {
    let client = this.createClient(username, password, origin);
    this.set('client', client);    
    this.writeCookies();
  },

  /**
   * Makes a request that will resolve if provided username, password and
   * origin are valid.
   * 
   * @param {string} username 
   * @param {string} password 
   * @param {string} [origin] 
   * @returns {Promise}
   */
  requestTestAuth(username, password, origin) {
    let client = this.createClient(username, password, origin);
    let api = new Onepanel.OnepanelApi(client);
    // invoke any operation that requires authentication
    return new Promise((resolve, reject) => {
      let callback = function (error, data, response) {
        if (error) {
          reject(error);
        } else {
          resolve(data, response);
        }
      };
      api.getClusterCookie(callback);
    });
  }

});
