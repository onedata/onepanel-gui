/* eslint-env node */
module.exports = {
  framework: 'mocha',
  test_page: 'tests/index.html?hidepassed',
  report_file: 'tmp/test-results.xml',
  disable_watching: true,
  launch_in_ci: [
    'Chrome',
  ],
  launch_in_dev: [
    'Chrome',
  ],
  browser_args: {
    Chrome: '--no-sandbox',
  },
};
