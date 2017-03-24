/* jshint node: true */

const DEFAULT_ONEPANEL_SERVICE_TYPE = 'zone';

module.exports = function (environment) {
  var ENV = {
    modulePrefix: 'onepanel-gui',
    environment: environment,
    // NOTE: the rootURL is set also in ember-cli-build for SASS function
    rootURL: '/',
    locationType: 'hash',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      },
      EXTEND_PROTOTYPES: {
        // Prevent Ember Data from overriding Date.parse.
        Date: false
      }
    },
    onedataTabs: [
      'clusters'
    ],
    onepanelConfig: {
      // TODO: validate: onezone or oneprovider
      /**
       * An important switch to enable/disable features of Provider or Zone
       * in application and make requests to proper onepanel API.
       *
       * One of: zone, provider
       *
       * @type {string}
       */
      ONEPANEL_SERVICE_TYPE: process.env.ONEPANEL_SERVICE_TYPE ||
        DEFAULT_ONEPANEL_SERVICE_TYPE
    },
    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    }
  };

  if (environment && environment.startsWith('development')) {
    // ENV.APP.LOG_RESOLVER = true;
    ENV.APP.LOG_ACTIVE_GENERATION = true;
    ENV.APP.LOG_TRANSITIONS = true;
    ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    ENV.APP.LOG_VIEW_LOOKUPS = true;

    // to launch inside original onepanel app
    if (environment !== 'development-backend') {
      ENV.APP.MOCK_BACKEND = true;
    }
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';

    ENV.APP.MOCK_BACKEND = true;
  }

  if (environment === 'production') {

  }

  return ENV;
};
