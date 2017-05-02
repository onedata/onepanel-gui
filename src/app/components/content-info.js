import Ember from 'ember';

/**
 * A component for predefined, usually nearly full-screen messages - content fillers.
 * Uses one-image to show a placeholder image.
 * Typical usage: 
 * 
 * @module components/content-info
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */
export default Ember.Component.extend({
  classNames: ['content-info'],

  /**
   * Header text
   * @type {string}
   */
  header: '',

  /**
   * Second header text
   * @type {string}
   */
  subheader: '',

  /**
   * Text used as a description
   * @type {string}
   */
  text: '',

  /**
   * Path to and image file (placed between the description and the primary button)
   * @type {string}
   */
  imagePath: null,

  /**
   * Text placed on the image
   * @type {string}
   */
  imageText: '',

  /**
   * CSS class for text placed on the image
   * @type {string}
   */
  imageTextClass: '',

  /**
   * Text inside primary button
   * @type {string}
   */
  buttonLabel: '',

  /**
   * CSS class for primary button
   * @type {string}
   */
  buttonClass: '',
  
  /**
   * A function on click primary button.
   * The function should return Promise which indicated status of action.
   * @type {Function}
   */
  buttonAction: null
});
