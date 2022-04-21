import resolver from './helpers/resolver';
import './helpers/responsive';
import { mocha, afterEach } from 'mocha';
import { start, setResolver } from 'ember-mocha';
import handleHidepassed from './handle-hidepassed';
// import silenceDeprecations from 'onedata-gui-common/utils/silence-deprecations';

// TODO: VFS-8903 remove
// silenceDeprecations();

setResolver(resolver);

mocha.setup({
  timeout: 5000,
});

handleHidepassed(afterEach);
start();
