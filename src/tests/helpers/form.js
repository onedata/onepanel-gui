export default class FormHelper {
  constructor($template, componentSelector = '') {
    this.$template = $template;
    this.$form = $template.find(componentSelector + ' form');
  }

  /**
   * @param {string} fieldName
   * @return {JQuery}
   */
  getInput(fieldName) {
    return this.$form.find('.field-' + fieldName);
  }

  submit() {
    this.$form.find('button[type=submit]').click();
  }
}
