import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import wait from 'ember-test-helpers/wait';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';


describe('Integration | Component | one form simple', function () {
  setupComponentTest('one-form-simple', {
    integration: true
  });

  beforeEach(function () {
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
      errors: [
        Ember.Object.create({
          attribute: 'allFieldsValues.main.first',
          message: 'error!'
        })
      ]
    });

    this.set('fields', FIELDS);
    this.set('fakeValidations', VALIDATIONS);
  });

  it('renders injected fields', function () {
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

  it('renders errors after field change', function (done) {
    this.render(hbs `
    {{one-form-simple
      validations=fakeValidations
      fields=fields
      submitButton=false
    }}
      `);
    
    let firstField = this.$('.field-first');
    let firstFieldMsg = firstField.next();
    expect(firstFieldMsg.text(),'field has no error before value change').to.be.empty;
    firstField.trigger('change');
    wait().then(() => {
      expect(firstFieldMsg.text(), 'field has error after change').to.eq('error!');
      done();
    });
  });

  it('renders errors after field looses its focus', function (done) {
    this.render(hbs `
    {{one-form-simple
      validations=fakeValidations
      fields=fields
      submitButton=false
    }}
      `);
    
    let firstField = this.$('.field-first');
    let firstFieldMsg = firstField.next();
    expect(firstFieldMsg.text(),'field has no error before value change').to.be.empty;
    firstField.blur();
    wait().then(() => {
      expect(firstFieldMsg.text(), 'field has error after change').to.eq('error!');
      done();
    });
  });

  it('reacts when field error changes', function (done) {
    this.render(hbs `
    {{one-form-simple
      validations=fakeValidations
      fields=fields
      submitButton=false
    }}
      `);
    
    let firstField = this.$('.field-first');
    let firstFieldMsg = firstField.next();
    firstField.blur();
    this.get('fakeValidations.errors')[0].set('message', 'error2!');
    wait().then(() => {
      expect(firstFieldMsg.text(), 'field has its another error').to.eq('error2!');
      done();
    });
  });

  it('changes submit button "disable" attribute', function (done) {
    this.set('submitAction', () => {
      expect(true, 'submitAction was invoked').to.eq(true);
      done();
      return new Ember.RSVP.Promise((resolve, reject) => reject());
    });

    this.render(hbs `
    {{one-form-simple
      validations=fakeValidations
      fields=fields
      submit=submitAction
    }}
      `);    
    
    let submitBtn = this.$('.btn-primary');
    expect(submitBtn.prop('disabled'), 'submit button is disabled if form is not valid').to.eq(true);

    this.get('fakeValidations').set('errors', []);
    this.get('fakeValidations').set('isValid', true);
    wait().then(() => {
      expect(submitBtn.prop('disabled'), 'submit button is enabled if form is valid').to.eq(false);
      submitBtn.click();
    });
  });
});
