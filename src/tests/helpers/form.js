export default class FormHelper {
  constructor($template, componentSelector = '') {
    this.$template = $template;
    this.$form = $template.find(componentSelector + ' form');
  }

  /**
   * DEPRECATED
   * @param {string} fieldName
   * @return {string}
   */
  _getInputId(fieldName) {
    return `${this.$form.attr('id')}-${fieldName}`;
  }

  /**
   * @param {string} fieldName
   * @return {JQuery}
   */
  getInput(fieldName) {
    return this.$form.find('.one-form-field-' + fieldName);
  }

  submit() {
    this.$form.find('button[type=submit]').click();
  }
}
