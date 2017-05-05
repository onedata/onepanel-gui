/**
 * A form for displaying basic auth user credentials and modify them 
 *
 * See ``changingPassword`` property to set 
 *
 * @module 
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import OneForm from 'onepanel-gui/components/one-form';
import { validator, buildValidations } from 'ember-cp-validations';
import { invokeAction } from 'ember-invoke-action';
import createFieldValidator from 'onepanel-gui/utils/create-field-validator';

const PASSWORD_DOT = '&#9679';

const {
  computed,
  computed: { readOnly },
  String: { htmlSafe },
} = Ember;

// TODO i18n

const USERNAME_FIELD = {
  name: 'username',
  label: 'Username',
  type: 'static',
};

const SECRET_PASSWORD_FIELD = {
  name: 'secretPassword',
  label: 'Password',
  type: 'static',
};

const CHANGE_PASSWORD_FIELDS = [{
    name: 'currentPassword',
    label: 'Current password',
    type: 'password',
  },
  {
    name: 'newPassword',
    label: 'New password',
    type: 'password',
  },
  {
    name: 'newPasswordRetype',
    label: 'Retype new password',
    type: 'password',
  },
];

function createValidations() {
  let validations = {};
  CHANGE_PASSWORD_FIELDS.forEach(field => {
    let thisValidations = validations['allFieldsValues.main.' + field.name] =
      createFieldValidator(field);
    switch (field.name) {
    case 'newPasswordRetype':
      // TODO i18n    
      thisValidations.push(validator('confirmation', {
        on: 'allFieldsValues.main.newPassword',
        message: 'Retyped password does not match'
      }));
      break;

    default:
      break;
    }
  });
  return validations;
}

const Validations = buildValidations(createValidations());

export default OneForm.extend(Validations, {
  classNames: ['user-credentials-form'],

  username: null,

  /**
   * If true, show form fields and buttojn for chane current password
   * @type {boolean}
   */
  changingPassword: false,

  /**
   * @type {FieldType}
   */
  usernameField: computed(() => Ember.Object.create(USERNAME_FIELD)).readOnly(),

  /**
   * @type {FieldType}
   */
  secretPasswordField: computed(() => Ember.Object.create(SECRET_PASSWORD_FIELD)).readOnly(),

  /**
   * @type {Array.FieldType}
   */
  changePasswordFields: computed(() => CHANGE_PASSWORD_FIELDS.map(f =>
    Ember.Object.create(f)
  )).readOnly(),

  allFieldsValues: Ember.Object.create({
    main: Ember.Object.create({
      username: null,
      secretPassword: htmlSafe(PASSWORD_DOT.repeat(5)),
      currentPassword: null,
      newPassword: null,
      newPasswordRetype: null,
    }),
  }),

  currentFieldsPrefix: 'main',

  allFields: computed('usernameField', 'changePasswordFields', 'secretPasswordField',
    function () {
      let {
        usernameField,
        changePasswordFields,
        secretPasswordField,
      } = this.getProperties(
        'usernameField',
        'changePasswordFields',
        'secretPasswordField'
      );
      return [usernameField, secretPasswordField, ...changePasswordFields];
    }),

  currentFields: computed('usernameField', 'changePasswordFields',
    'secretPasswordField', 'changingPassword',
    function () {
      let {
        changingPassword,
        usernameField,
        changePasswordFields,
        secretPasswordField,
      } = this.getProperties(
        'changingPassword',
        'usernameField',
        'changePasswordFields',
        'secretPasswordField'
      );

      if (changingPassword) {
        return [usernameField, ...changePasswordFields];
      } else {
        return [usernameField, secretPasswordField];
      }
    }),

  submitEnabled: readOnly('validations.isValid'),

  init() {
    this._super(...arguments);
    this.set('formValues.username', this.get('username'));
    this.prepareFields();
  },

  actions: {
    submit() {
      if (this.get('submitEnabled')) {
        return invokeAction(this, 'submit', {
          currentPassword: this.get('formValues.currentPassword'),
          newPassword: this.get('formValues.newPassword'),
        });
      }
    },

    startChangePassword() {
      this.set('changingPassword', true);
    },

    inputChanged(fieldName, value) {
      this.changeFormValue(fieldName, value);
    },

    focusOut(field) {
      field.set('changed', true);
      this.recalculateErrors();
    },
  }
});
