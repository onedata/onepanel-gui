import { expect } from 'chai';
import { describe, it } from 'mocha';
import { localSelector } from 'onepanel-gui/helpers/local-selector';

describe('Unit | Helper | local selector', function () {
  it('generates jQuery selector that find element in current component', function () {
    let result = localSelector(['some-id', '.my-class']);
    expect(result).to.be.equal('#some-id .my-class');
  });
});
