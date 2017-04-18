import Ember from 'ember';
import OneForm from 'onepanel-gui/components/one-form';

const PASSWORD_DOT = '&#9679';

const {
  computed,
  String: { htmlSafe },
} = Ember;

// TODO validations
// function createValidations(storageTypes, genericFields) {
//   let validations = {};
//   storageTypes.forEach(type => {
//     type.fields.concat(genericFields).forEach(field => {
//       let fieldName = 'allFieldsValues.' + type.id + '.' + field.name;
//       validations[fieldName] = [];
//       if (!field.optional) {
//         validations[fieldName].push(validator('presence', true));
//       }
//       if (field.type === 'number') {
//         validations[fieldName].push(validator('number', Ember.Object.create({
//           allowString: true,
//           allowBlank: field.optional
//         })));
//       }
//     });
//   });
//   return validations;
// }
// const Validations = buildValidations(createValidations(storageTypes, GENERIC_FIELDS));

const Validations = {};

// TODO i18n

const USERNAME_FIELD = {
  name: 'username',
  placeholder: 'Username',
  type: 'static',
};

const SECRET_PASSWORD_FIELD = {
  name: 'secretPassword',
  placeholder: 'Password',
  type: 'static',
};

const CHANGE_PASSWORD_FIELDS = [{
    name: 'oldPassword',
    placeholder: 'Current password',
    type: 'password',
  },
  {
    name: 'newPassword',
    placeholder: 'New password',
    type: 'password',
  },
  {
    nmae: 'newPasswordRetype',
    placeholder: 'Retype new password',
    type: 'password',
  },
];

export default OneForm.extend(Validations, {
  username: null,

  /**
   * If true, show form fields and buttojn for chane current password
   * @type {boolean}
   */
  changingPassword: false,

  usernameField: computed(() => USERNAME_FIELD).readOnly(),
  secretPasswordField: computed(() => SECRET_PASSWORD_FIELD).readOnly(),

  formValues: Ember.Object.create({
    username: null,
    secretPassword: htmlSafe(PASSWORD_DOT.repeat(5)),
    oldPassword: null,
    newPassword: null,
    newPasswordRetype: null,
  }),

  init() {
    this._super(...arguments);
    this.set('formValues.username', this.get('username'));
  },

  currentFields: computed('changingPassword', function () {
    if (this.get('changingPassword')) {
      return [USERNAME_FIELD, ...CHANGE_PASSWORD_FIELDS];
    } else {
      return [USERNAME_FIELD, SECRET_PASSWORD_FIELD];
    }
  }),

  actions: {
    submitChangePassword() {
      // FIXME
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
