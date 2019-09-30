export default {
  header: 'GUI settings',
  tabs: {
    signInNotification: {
      header: 'Sign-in notification',
      description: 'Sign-in notification is a short message, that will be displayed to every user on the sign-in page. It can contain important announcements like possible downtime of the system or incoming upgrade.',
      signinNotificationEnabled: 'Sign-in notification enabled',
      save: 'Save',
      emptyContentWarning: 'Sign-in notification is enabled, but it has no content.',
    },
    privacyPolicy: {
      header: 'Privacy policy',
      description: 'Privacy policy is a description of all the ways a service manages user data (GDPR).',
      privacyPolicyEnabled: 'Privacy policy enabled',
      save: 'Save',
      emptyContentWarning: 'Privacy policy is enabled, but it has no content.',
    },
    cookieConsentNotification: {
      header: 'Cookie consent notification',
      description: 'Cookie consent notification is a short text in floating window, that will be visible to every new user until he accepts it. It can contain link to privacy policy to keep the notification short.',
      cookieConsentNotificationEnabled: 'Cookie consent notification enabled',
      insertPrivacyPolicyLink: 'Insert privacy policy link',
      privacyPolicy: 'privacy policy',
      save: 'Save',
      emptyContentWarning: 'Cookie consent notification is enabled, but it has no content.',
    },
  },
};
