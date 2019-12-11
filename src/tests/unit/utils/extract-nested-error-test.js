import { expect } from 'chai';
import { describe, it } from 'mocha';
import extractNestedError from 'onepanel-gui/utils/extract-nested-error';

describe('Unit | Utility | extract nested error', function () {
  it('returns passed error if it not contains a nested error', function () {
    const error = {
      id: 'someError',
      details: 1,
    };

    expect(extractNestedError(error)).to.equal(error);
  });

  it('returns nested error if passed error has id "errorOnNodes"', function () {
    const error = {
      id: 'errorOnNodes',
      details: {
        error: {
          id: 'someError',
          details: 1,
        },
      },
    };

    expect(extractNestedError(error)).to.equal(error.details.error);
  });
});
