import { start, setResolver } from 'ember-mocha';
import { mocha, afterEach } from 'mocha';
import { setApplication } from '@ember/test-helpers';
import resolver from './helpers/resolver';
import Application from '../app';
import config from '../config/environment';
import { unsuppressRejections } from './helpers/suppress-rejections';
import checkSyncObservers from './helpers/check-sync-observers';
import handleHidepassed from './handle-hidepassed';
import sinon from 'sinon';
import globals from 'onedata-gui-common/utils/globals';

mocha.setup({
  timeout: 5000,
});
setResolver(resolver);
setApplication(Application.create(config.APP));

afterEach(unsuppressRejections);
afterEach(() => sinon.restore());
afterEach(() => globals.unmock());
afterEach(() => {
  checkSyncObservers();
});

handleHidepassed(afterEach);
start();
