import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import Ember from 'ember';


describe('Unit | Component | one form', function () {
  setupComponentTest('one-form', {
    unit: true
  });

  beforeEach(function() {
    const FIELDS = {
      main: [Ember.Object.create({
        name: 'first',
        type: 'text',
      })],
      another: [Ember.Object.create({
        name: 'second',
        type: 'text',
      })]
    };
    const ALL_FIELDS = Object.values(FIELDS).reduce((a, b) => a.concat(b));
    const CURRENT_FIELDS = FIELDS.main;
    const ALL_FIELDS_VALUES = Ember.Object.create({
      main: Ember.Object.create({first: null}),
      another: Ember.Object.create({second: null}),
    });
    const VALIDATIONS = Ember.Object.create({
      errors: [
        Ember.Object.create({
          attribute: 'allFieldsValues.main.first',
          message: 'error!'
        })
      ]
    });
    this.subject().setProperties({
      allFields: ALL_FIELDS,
      currentFields: CURRENT_FIELDS,
      allFieldsValues: ALL_FIELDS_VALUES,
      currentFieldsPrefix: 'main',
      validations: VALIDATIONS,
    });
    this.subject().prepareFields();
  });

  it('detects errors while validation', function () {
    expect(this.subject().get('isValid'), 'form is invalid').to.eq(false);

    // simulates text input to show an error message
    this.subject().changeFormValue('first', 'sth');
    expect(this.subject().get('currentFields')[0].get('message'), 'field has error (after edition)').to.eq('error!');
  });

  it('ignores errors in another fields group', function () {
    this.subject().set('currentFieldsPrefix', 'another');
    expect(this.subject().get('isValid'), 'form is valid').to.eq(true);
    expect(this.subject().get('currentFields')[0].get('message'), 'field has no error').to.be.empty;
  });

  it('ignores errors if field was not edited', function () {
    expect(this.subject().get('isValid'), 'form is invalid').to.eq(false);
    expect(this.subject().get('currentFields')[0].get('message'), 'field has no error').to.be.empty;
  });

  it('detects that new errors have occurred', function () {
    const error = this.subject().get('validations').get('errors')[0];
    this.subject().get('validations').set('errors', []);
    expect(this.subject().get('isValid'), 'form is valid when errors disappear').to.eq(true);
    this.subject().get('validations').set('errors', [error]);
    expect(this.subject().get('isValid'), 'form is again invalid when errors occurred').to.eq(false);
  });

  it('can reset fields state and value', function () {
    this.subject().changeFormValue('first', 'sth');
    this.subject().resetFormValues();
    expect(this.subject().get('isValid'), 'form is still invalid after reset').to.eq(false);
    expect(this.subject().get('fieldValues.first'), 'field is empty after reset').to.be.empty;
    expect(this.subject().get('currentFields')[0].get('message'), 'field has no error after reset').to.be.empty;
  });

  it('detects that given field is not in current fields group', function () {
    expect(this.subject().isKnownField('first'), 
      'form recognizes field, which exists in current fields group').to.eq(true);
    expect(this.subject().isKnownField('second'), 
      'form does not recognize field, which does not exists in current fields group').to.eq(false);
  });

  it('allows to change field value', function () {
    expect(this.subject().get('formValues.first'), 'initial field value == null').to.eq(null);
    this.subject().changeFormValue('first', 'sth');
    expect(this.subject().get('formValues.first'), 
      'field value changed after changeFormValue method call').to.eq('sth');
  });
});
