/* eslint-env node */
'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const suppressNodeBuildErrors = require(
  './lib/onedata-gui-common/addon/utils/suppress-node-build-errors'
);
const defineSassColors = require(
  './lib/onedata-gui-common/addon/utils/define-sass-colors'
);
const defineSassBreakpoints = require(
  './lib/onedata-gui-common/addon/utils/define-sass-breakpoints'
);
const colors = require('./lib/onedata-gui-common/config/colors');
const breakpoints = require('./lib/onedata-gui-common/config/breakpoints');
const sass = require('sass-embedded');

const environment = EmberApp.env();

module.exports = function (defaults) {
  suppressNodeBuildErrors();

  const app = new EmberApp(defaults, {
    'fingerprint': {
      extensions: [
        'js',
        'css',
        'map',
        'svg',
        'png',
        'jpg',
        'gif',
        'webmanifest',
        'ttf',
        'woff',
        'woff2',
        'svg',
        'eot',
      ],
      exclude: ['assets/images/auth-providers/**'],
      replaceExtensions: ['html', 'css', 'js', 'webmanifest'],
      generateAssetMap: true,
      fingerprintAssetMap: true,
    },
    // see: https://github.com/babel/ember-cli-babel/tree/v7.3.0#options
    'babel': {},
    'sassOptions': {
      implementation: sass,
      outputStyle: 'expanded',
      includePaths: [
        'app/styles',
        // onedata-gui-common addon
        'lib/onedata-gui-common/app/styles',
        'lib/onedata-gui-common/app/styles/onedata-gui-common',
        'lib/onedata-gui-common/app/styles/onedata-gui-common/oneicons',
        'lib/onedata-gui-common/app/styles/onedata-gui-common/components',
      ],
      onlyIncluded: false,
    },
    // a "bootstrap" should be imported into app.scss
    'ember-cli-bootstrap-sassy': {
      // import SASS styles and some JS that is used outside of ember-bootstrap components
      js: [
        'transition',
        // TODO: rewrite collapses to ember-bootstrap components
        'tooltip',
        'collapse',
        'popover',
      ],
      glyphicons: false,
    },
    // import only JS
    'ember-bootstrap': {
      importBootstrapCSS: false,
      importBootstrapTheme: false,
      importBootstrapFont: true,
      bootstrapVersion: 3,
    },
    'ember-cli-chartist': {
      useCustomCSS: true,
    },
    'ember-cli-string-helpers': {
      only: ['dasherize'],
    },
    'ace': {
      themes: ['textmate'],
      modes: ['json', 'xml'],
      workers: ['json', 'xml'],
      exts: ['searchbox'],
      workerPath: './assets/ace',
    },
    'autoImport': {
      publicAssetURL: environment === 'test' ? '/assets/' : './assets/',
      webpack: {
        module: {
          // special rule for swagger-codegen generated lib
          // see: https://github.com/swagger-api/swagger-codegen/issues/3466
          // also not using old syntax (imports-loader=>define) but new config equivalent
          rules: [{
            test: /onepanel[/\\]+.*\.js$/,
            use: [{
              loader: 'imports-loader',
              options: {
                additionalCode: 'var define = false;',
              },
            }],
          }],
        },
      },
    },
  });

  defineSassColors(app, colors);
  defineSassBreakpoints(app, breakpoints);

  // Generate app-config.json for environment that is used.
  // Currently app-config.json is always overwritten on build.

  // Use `app.import` to add additional libraries to the generated
  // output files.
  //
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.

  const NODE_ASSETS = [
    'chartist-plugin-legend/chartist-plugin-legend.js',
    'jquery.scrollto/jquery.scrollTo.min.js',
    'input-tokenizer/tokenizer.min.js',
    'basictable/basictable.css',
    'perfect-scrollbar/css/perfect-scrollbar.css',
    'webui-popover/dist/jquery.webui-popover.css',
    'webui-popover/dist/jquery.webui-popover.js',
    'jquery-datetimepicker/build/jquery.datetimepicker.min.css',
    'jquery-datetimepicker/build/jquery.datetimepicker.full.js',
    'spin.js/spin.css',
  ];

  NODE_ASSETS.forEach(path => app.import(`node_modules/${path}`));

  return app.toTree();
};
