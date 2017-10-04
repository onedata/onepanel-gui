import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import { fillIn, blur } from 'ember-native-dom-helpers';
import sinon from 'sinon';

describe('Integration | Component | space cleaning conditions form', function() {
  setupComponentTest('space-cleaning-conditions-form', {
    integration: true,
  });

  it('is filled in with injected data', function(done) {
    this.set('data', {
      fileSizeGreaterThan: 1048576,
      fileSizeLesserThan: 2097152,
      fileTimeNotActive: 7200,
    });
    this.render(hbs`
      {{space-cleaning-conditions-form
        data=data
        formSendDebounceTime=0}}`);

    const greaterGroup = this.$('.fileSizeGreaterThanGroup');
    const lesserGroup = this.$('.fileSizeLesserThanGroup');
    const timeGroup = this.$('.fileTimeNotActiveGroup');
    expect(greaterGroup.find('input')).to.have.value('1');
    expect(lesserGroup.find('input')).to.have.value('2');
    expect(timeGroup.find('input')).to.have.value('2');
    wait().then(() => {
      expect(greaterGroup.find('.ember-power-select-selected-item'))
        .to.contain('MiB');
      expect(lesserGroup.find('.ember-power-select-selected-item'))
        .to.contain('MiB');
      expect(timeGroup.find('.ember-power-select-selected-item'))
        .to.contain('Hours');
      done();
    });
  });

  [
    'fileSizeGreaterThan',
    'fileSizeLesserThan',
    'fileTimeNotActive',
  ].forEach((fieldName) => {
    it(`does not accept letters in ${fieldName} input`, function(done) {
      this.render(hbs`{{space-cleaning-conditions-form formSendDebounceTime=0}}`);
      
      const group = this.$(`.${fieldName}Group`);
      fillIn(group.find('input')[0], 'asdf').then(() => {
        expect(group).to.have.class('has-error');
        done();
      });
    });

    it(`does not accept negative numbers in ${fieldName} input`, function(done) {
      this.render(hbs`{{space-cleaning-conditions-form formSendDebounceTime=0}}`);
      
      const group = this.$(`.${fieldName}Group`);
      fillIn(group.find('input')[0], '-3').then(() => {
        expect(group).to.have.class('has-error');
        done();
      });
    });

    it(`accepts positive numbers in ${fieldName} input`, function(done) {
      this.render(hbs`{{space-cleaning-conditions-form formSendDebounceTime=0}}`);
      
      const group = this.$(`.${fieldName}Group`);
      fillIn(group.find('input')[0], '10').then(() => {
        expect(group).not.to.have.class('has-error');
        done();
      });
    });

    it(`sends data after ${fieldName} input focus lost`, function(done) {
      const saveSpy = sinon.spy();
      this.on('onSave', saveSpy);
      this.render(hbs`
        {{space-cleaning-conditions-form
          formSendDebounceTime=0
          onSave=(action "onSave")}}`);
      
      const saveArg = {};
      if (fieldName === 'fileTimeNotActive') {
        saveArg.fileTimeNotActive = 259200;
      } else {
        saveArg[fieldName] = 3145728;
      }
      const inputSelector = `.${fieldName}Group input`;
      fillIn(inputSelector, '3').then(() => {
        blur(inputSelector).then(() => {
          expect(saveSpy).to.be.calledOnce;
          expect(saveSpy).to.be.calledWith(saveArg);
          done();
        });
      });
    });
  });

  it('does not accept float numbers in fileTimeNotActive input', function(done) {
    this.render(hbs`{{space-cleaning-conditions-form formSendDebounceTime=0}}`);
    
    const group = this.$('.fileTimeNotActiveGroup');
    fillIn(group.find('input')[0], '3.4').then(() => {
      expect(group).to.have.class('has-error');
      done();
    });
  });

  it('debounce changes save', function(done) {
    const saveSpy = sinon.spy();
    this.on('onSave', saveSpy);
    this.render(hbs`
      {{space-cleaning-conditions-form
        formSendDebounceTime=0
        onSave=(action "onSave")}}`);
    
    const saveArg = {
      fileSizeGreaterThan: 2097152,
      fileSizeLesserThan: 3145728,
    };
    const greaterInputSelector = '.fileSizeGreaterThanGroup input';
    const lesserInputSelector = '.fileSizeLesserThanGroup input';
    fillIn(lesserInputSelector, '3').then(() => {
      fillIn(greaterInputSelector, '2').then(() => {
        blur(greaterInputSelector).then(() => {
          expect(saveSpy).to.be.calledOnce;
          expect(saveSpy).to.be.calledWith(saveArg);
          done();
        });
      });
    });
  });
});
