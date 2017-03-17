/*jshint node:true*/
/* global require, module */

var sass = require('node-sass');

var EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function (defaults) {
  var app = new EmberApp(defaults, {
    sassOptions: {
      includePaths: [
        'app/styles',
        'app/styles/oneicons'
      ],
      functions: {
        rootUrl: function () {
          // temporary for testing app with old onepanel
          var rootUrl = (app.env === 'development-backend' ?
            '/js/panel-gui' : '');
          return new sass.types.String(rootUrl);
        }
      }
    },
    // a "bootstrap" should be imported into app.scss
    'ember-cli-bootstrap-sassy': {
      // import SASS styles and some JS that is used outside of ember-bootstrap components 
      'js': [
        // TODO: use ember-bootstrap tooltip (needs refactoring and removing own bs-tooltip component)
        'tooltip',
        'transition',
        // TODO: rewrite collapses to ember-bootstrap components
        'collapse',
        // TODO: use bs-alert inside alert-panel component
        'alert',
        // TODO: rewrite dropdowns to ember-bootstrap components
        'dropdown'
      ],
      'glyphicons': false
    },
    // import only JS
    'ember-bootstrap': {
      'importBootstrapCSS': false,
      'importBootstrapTheme': false,
      'importBootstrapFont': false
    }
  });

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

  const BOWER_ASSETS = [
    'basictable/jquery.basictable.min.js',
    'basictable/basictable.css'
  ];

  BOWER_ASSETS.forEach(path => app.import(app.bowerDirectory + '/' + path));

  return app.toTree();
};
