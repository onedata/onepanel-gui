import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
// import DOMPurify from 'npm:dompurify';
// import { computed } from '@ember/object';
// import { htmlSafe } from '@ember/string';

export default Component.extend(I18n, {
  classNames: ['content-clusters-gui-settings'],

  /**
   * @override
   */
  i18nPrefix: 'components.contentClustersGuiSettings',

  // value: '<a onclick="javascript:alert(\'asdf\')">ddd</a>',

  // safeValue: computed('value', function () {
  //   return htmlSafe(DOMPurify.sanitize(this.get('value')));
  // }),
});
