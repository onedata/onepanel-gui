import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

describe('Integration | Component | one form simple', function () {
  setupComponentTest('one-form-simple', {
    integration: true
  });

  it('renders injected fields', function () {
    const FIELDS = [{
        name: 'first',
        type: 'text',
      },
      {
        name: 'second',
        type: 'text',
      }
    ];

    const VALIDATIONS = Ember.Object.create({
      errors: [],
    });

    this.set('fields', FIELDS);
    this.set('fakeValidations', VALIDATIONS);

    this.render(hbs `
    {{one-form-simple
      validations=fakeValidations
      fields=fields
      submitButton=false
    }}
      `);

    expect(this.$('.field-first'), 'field first').to.exist;
    expect(this.$('.field-second'), 'field second').to.exist;
  });
});
