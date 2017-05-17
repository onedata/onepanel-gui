/* jshint node: true */

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
      { id: 'clusters', icon: 'menu-clusters' },
      // features below are not available yet
      // { id: 'providers', icon: 'provider' },
      // { id: 'data', icon: 'folder' },
      // { id: 'promises', icon: 'star' },
      // { id: 'spaces', icon: 'space' },
      // { id: 'groups', icon: 'groups' },
      // { id: 'shares', icon: 'share' },
      // { id: 'tokens', icon: 'tokens' },
    ],
    layoutConfig: {
      formLabelColumns: 'col-xs-12 col-sm-5',
      formInputColumns: 'col-xs-12 col-sm-7',
      formSubmitColumns: 'col-xs-12 col-sm-7 col-sm-offset-5 text-xs-center',
      formToggleLabelColumns: 'col-xs-6 col-sm-5',
      formToggleInputColumns: 'col-xs-6 col-sm-7',
    },
    'ember-simple-auth': {
      authenticationRoute: 'login',
      routeAfterAuthentication: 'onedata',
      routeIfAlreadyAuthenticated: 'onedata',
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
