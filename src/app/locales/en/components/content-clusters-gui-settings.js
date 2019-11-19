export default {
  header: 'GUI settings',
  tabs: {
    signInNotification: {
      header: 'Sign-in notification',
      description: 'Sign-in notification is a short message that will be displayed to every user on the sign-in page. It can contain important announcements, such as possible downtime of the system or incoming upgrade. Only plain text without HTML tags is allowed.',
      signinNotificationEnabled: 'Sign-in notification enabled',
      save: 'Save',
      emptyContentWarning: 'Sign-in notification is enabled, but content is missing - please fill it in below.',
      emptyContentTabWarning: 'Sign-in notification is enabled, but content is missing.',
    },
    privacyPolicy: {
      header: 'Privacy policy',
      description: 'Privacy policy is a statement that describes how this service manages user data. May be required depending on the location of the service (e.g. in EU it is required by the GDPR).',
      privacyPolicyEnabled: 'Privacy policy enabled',
      save: 'Save',
      emptyContentWarning: 'Privacy policy is enabled, but content is missing - please fill it in below.',
      emptyContentTabWarning: 'Privacy policy is enabled, but content is missing.',
    },
    cookieConsentNotification: {
      header: 'Cookie consent notification',
      description: 'Cookie consent notification is a short text in a floating pop-up that will be visible to every user unless accepted. It can contain a link to the privacy policy for detailed description. Only plain text without HTML tags is allowed.',
      cookieConsentNotificationEnabled: 'Cookie consent notification enabled',
      insertPrivacyPolicyLink: 'Insert privacy policy link',
      privacyPolicy: 'privacy policy',
      save: 'Save',
      emptyContentWarning: 'Cookie consent notification is enabled, but content is missing - please fill it in below.',
      emptyContentTabWarning: 'Cookie consent notification is enabled, but content is missing.',
    },
  },
};