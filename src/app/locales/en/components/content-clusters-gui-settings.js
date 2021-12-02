export default {
  header: 'GUI settings',
  tabs: {
    signInNotification: {
      header: 'Sign-in notification',
      description: 'Sign-in notification is a short message that will be displayed to every user on the sign-in page. It can contain important announcements, such as possible downtime of the system or incoming upgrade. Only plain text without HTML tags is allowed.',
      signinNotificationEnabled: 'Sign-in notification enabled',
      save: 'Save',
      emptyContentWarning: 'Sign-in notification is enabled, but content is missing – please fill it in below.',
      emptyContentTabWarning: 'Sign-in notification is enabled, but content is missing.',
    },
    privacyPolicy: {
      header: 'Privacy policy',
      description: 'Privacy policy is a statement that describes how this service manages user data. May be required depending on the location of the service (e.g. in EU it is required by the GDPR).',
      privacyPolicyEnabled: 'Privacy policy enabled',
      save: 'Save',
      emptyContentWarning: 'Privacy policy is enabled, but content is missing – please fill it in below.',
      emptyContentTabWarning: 'Privacy policy is enabled, but content is missing.',
    },
    termsOfUse: {
      header: 'Terms of use',
      description: 'The Terms of Use document defines a set of rules that restrict the ways in which the service may be used by the users. Also known as Terms of Service, Terms and Conditions or Conditions of Use. May include an Acceptable Use Policy.',
      termsOfUseEnabled: 'Terms of use enabled',
      save: 'Save',
      emptyContentWarning: 'Terms of use are enabled, but content is missing – please fill it in below.',
      emptyContentTabWarning: 'Terms of use are enabled, but content is missing.',
    },
    cookieConsentNotification: {
      header: 'Cookie consent notification',
      description: 'Cookie consent notification is a short text in a floating pop-up that will be visible to every user unless accepted. It should contain information how HTTP cookies are used across the service. Only plain text without HTML tags is allowed.',
      cookieConsentNotificationEnabled: 'Cookie consent notification enabled',
      insertPrivacyPolicyLink: 'Insert privacy policy link',
      privacyPolicy: 'privacy policy',
      insertTermsOfUseLink: 'Insert terms of use link',
      termsOfUse: 'Terms of use',
      save: 'Save',
      emptyContentWarning: 'Cookie consent notification is enabled, but content is missing – please fill it in below.',
      emptyContentTabWarning: 'Cookie consent notification is enabled, but content is missing.',
    },
  },
};
