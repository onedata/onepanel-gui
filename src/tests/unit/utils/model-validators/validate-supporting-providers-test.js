import { expect } from 'chai';
import { describe, it } from 'mocha';
import validateSupportingProviders from 'onepanel-gui/utils/model-validators/validate-supporting-providers';

describe(
  'Unit | Utility | model validators/validate  model validators/supporting providers',
  function () {
    it('returns false for lack of supportingProviders at all', function () {
      let result = validateSupportingProviders(undefined);
      expect(result).to.be.false;
    });

    it('returns false if supportingProviders has no properties at all',
      function () {
        let result = validateSupportingProviders({});
        expect(result).to.be.false;
      });

    it('returns true if supportingProviders is Object with at least one property',
      function () {
        let result = validateSupportingProviders({
          someProvider: '',
        });
        expect(result).to.be.true;
      });
  });
