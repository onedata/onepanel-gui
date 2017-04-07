// FIXME

// import { expect } from 'chai';
// import { describe, it } from 'mocha';
// import { setupComponentTest } from 'ember-mocha';
// import hbs from 'htmlbars-inline-precompile';
// import wait from 'ember-test-helpers/wait';

// describe('Integration | Component | cluster spaces table item', function () {
//   setupComponentTest('cluster-spaces-table-item', {
//     integration: true
//   });

//   it('shows a revoke confirmation box when clicking on revoke button', function (done) {
//     let space = {
//       id: 'space1',
//       name: 'Space One',
//     };

//     this.set('space', space);
//     this.render(hbs `
//     {{#one-collapsible-list as |list|}}
//       {{#list.item as |listItem|}}
//         {{cluster-spaces-table-item space=space listItem=listItem}}
//       {{/list.item}}
//     {{/one-collapsible-list}}
//     `);

//     this.$('.btn-revoke-space').click();
//     wait().then(() => {
//       expect(this.$('.popover-revoke-space-support')).to.have.length(1);
//       done();
//     });

//   });
// });
