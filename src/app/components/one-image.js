import Ember from 'ember';

/**
 * Inserts an image with optional - dynamicly sized - text.
 * Typical usage: 
 * ```
 * {{one-image 
 *   imagePath='some/image.png' 
 *   imageText='some text' 
 *   imageTextClass='classForTextElement'
 * }}```
 * @module components/one-image
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */
export default Ember.Component.extend({
  classNames: ['one-image'],

  /**
   * Path to an image file
   * @type {string}
   */
  imagePath: null,
  /**
   * Text, that will be placed with the image
   * @type {string}
   */
  imageText: '',
  /**
   * CSS class for text element. It should handle with positioning if neccessary.
   * @type {string}
   */
  imageTextClass: '',

  didInsertElement() {
    this._super(...arguments);
    $(window).resize(() => this._recalculateImageFontSize());
    this.$('.image').on('load', () => this._recalculateImageFontSize());
  },

  _recalculateImageFontSize() {
    if (this.get('imageText')) {
      // 10% of image width
      const fontSize = this.$(".image").width() * 0.10;
      this.$().css('font-size', fontSize);
    }
  }
});
