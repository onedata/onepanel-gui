import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

describe('Integration | Component | one collapsible toolbar', function() {
  setupComponentTest('one-collapsible-toolbar', {
    integration: true
  });

  it('renders in full version in large container', function(done) {
    this.render(hbs`
      <div style="width: 1000px">
        {{#one-collapsible-toolbar as |toolbar|}}
          {{#toolbar.item}}
            Button
          {{/toolbar.item}}
        {{/one-collapsible-toolbar}}
      </div>
    `);
    wait().then(() => {
      expect(this.$('.collapsible-toolbar-buttons').is('.hidden'), 
        'buttons are visible').to.be.false;
      expect(this.$('.collapsible-toolbar-toggle').is('.hidden'), 
        'toggle is hidden').to.be.true;
      done();
    });
  });

  it('renders in minimized version in small container', function(done) {
    this.render(hbs`
      <div style="width: 10px">
        {{#one-collapsible-toolbar as |toolbar|}}
          {{#toolbar.item}}
            Button
          {{/toolbar.item}}
        {{/one-collapsible-toolbar}}
      </div>
    `);
    wait().then(() => {
      expect(this.$('.collapsible-toolbar-buttons').is('.hidden'), 
        'buttons are hidden').to.be.true;
      expect(this.$('.collapsible-toolbar-toggle').is('.hidden'), 
        'toggle is visible').to.be.false;
      done();
    });
  });

  it('renders buttons properly', function(done) {
    let actionOccurred = false;
    this.set('itemAction', () => {
      actionOccurred = true;
    });
    this.render(hbs`
      {{#one-collapsible-toolbar as |toolbar|}}
        {{#toolbar.item buttonStyle="danger" triggerClasses="trigger-class" 
          buttonSize="xs" itemAction=itemAction}}
          Button
        {{/toolbar.item}}
      {{/one-collapsible-toolbar}}
    `);
    let button = this.$('button');
    wait().then(() => {
      expect(button.is('.btn-danger'), 'button has proper style class').to.be.true;
      expect(button.is('.trigger-class'), 'button has trigger class').to.be.true;
      expect(button.is('.btn-xs'), 'button has proper size class').to.be.true;
      button.click();
      wait().then(() => {
        expect(actionOccurred, 'click action occurred').to.be.true;
        done();
      });
    });
  });

  it('renders dropdown properly', function(done) {
    let actionOccurred = false;
    this.set('itemAction', () => {
      actionOccurred = true;
    });
    this.render(hbs`
      <div style="width: 20px;">
        {{#one-collapsible-toolbar as |toolbar|}}
          {{#toolbar.item triggerClasses="trigger-class" itemAction=itemAction}}
            Button
          {{/toolbar.item}}
        {{/one-collapsible-toolbar}}
      </div>
    `);
    wait().then(() => {
      this.$('.collapsible-toolbar-toggle').click();
      wait().then(() => {
        let popover = $('body .webui-popover.in');
        expect(popover.length, 'shows popover after click').to.equal(1);
        let item = popover.find('a');
        expect(item.is('.trigger-class'), 'dropdown item has trigger class').to.be.true;
        item.click();
        wait().then(() => {
          expect(actionOccurred, 'click action occurred').to.be.true;
          expect(popover.is('.in'), 'hides popover after item click').to.be.false;
          done();
        });  
      });
    });
  });
});
