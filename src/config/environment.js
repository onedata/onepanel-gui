/* eslint-env node */
'use strict';

module.exports = function (environment) {
  var ENV = {
    'modulePrefix': 'onepanel-gui',
    'environment': environment,
    // NOTE: the rootURL is set also in ember-cli-build for SASS function
    'rootURL': null,
    'locationType': 'hash',
    'EmberENV': {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      },
      EXTEND_PROTOTYPES: {
        String: true,
        Array: true,
        // Prevent Ember Data from overriding Date.parse.
        Date: false,
      },
    },
    /**
     * Objects in collection:
     * - id: string
     * - icon: string
     * - [isDefault]: boolean If true, then page under that menu item will be
     *     a default choice when URL does not specify selected menu item.
     *     Only one menu item can be default.
     * - [defaultAspect]: string Aspect name, that should be rendered, when
     *     URL does not specify any
     * - [allowIndex]: boolean If true and URL does not specify any resource,
     *     then router will allow showing page not related to any resource -
     *     index page for resource type of that menu item.
     * - [stickyBottom]: boolean If true, menu item will stick to the bottom
     *     edge of main-menu column (only in desktop mode) regardless scroll
     * - [visibilityCondition]: string String in format
     *     `serviceName.propertyName`, that will point to boolean value. If it
     *     will be true, then menu item will be visible, hidden otherwise.
     *     `propertyName` can represent a nested property in standard format
     *     `some.nested.property`.
     * - [component]: string Custom component name, that should be used to
     *     render menu item.
     */
    'onedataTabs': [
      { id: 'spaces', icon: 'browser-directory' },
      { id: 'shares', icon: 'browser-share' },
      { id: 'providers', icon: 'provider' },
      { id: 'groups', icon: 'groups' },
      { id: 'tokens', icon: 'tokens' },
      { id: 'harvesters', icon: 'light-bulb' },
      {
        id: 'clusters',
        icon: 'cluster',
        isDefault: true,
        defaultAspect: 'overview',
      },
    ],
    'layoutConfig': {
      formLabelColumns: 'col-xs-12 col-sm-5',
      formInputColumns: 'col-xs-12 col-sm-7',
      formSubmitColumns: 'col-xs-12 col-sm-7 col-sm-offset-5 text-xs-center',
      formToggleLabelColumns: 'col-xs-9 col-sm-5',
      formToggleInputColumns: 'col-xs-3 col-sm-7 text-xs-right',
    },
    'ember-simple-auth': {
      authenticationRoute: 'login',
      routeAfterAuthentication: 'onedata',
      routeIfAlreadyAuthenticated: 'onedata',
    },
    'time': {
      /**
       * How long to wait before redirecting to new configured domain of Oneprovider [ms]
       * @type {number}
       */
      redirectDomainDelay: 5000,
    },
    'i18n': {
      defaultLocale: 'en',
    },
    'APP': {
      // Here you can pass flags/options to your application instance
      // when it is created
    },
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
    ENV.rootURL = '/';

    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';

    ENV.APP.MOCK_BACKEND = true;
  }

  if (environment === 'production') {
    // empty 
  }

  return ENV;
};
