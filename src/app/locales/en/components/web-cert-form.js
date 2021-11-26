export default {
  submit: 'Modify certificate settings',
  modifyingWebCert: 'modifying web certificate',
  fields: {
    letsEncrypt: {
      label: 'Use Let\'s Encrypt',
      tip: 'If enabled, the certificate is obtained from Let\'s Encrypt service and renewed automatically. Otherwise, the certificate management is up to the administrator.',
    },
    expirationTime: {
      label: 'Expiration time',
      tip: 'Installed certificate\'s expiration time.',
      warningTip: 'Your certificate expires soon.',
    },
    creationTime: {
      label: 'Creation time',
      tip: 'Installed certificate\'s creation time.',
    },
    domain: {
      label: 'Domain',
      tip: 'The domain (Common Name) for which current certificate was issued.',
      warningTip: 'This domain is different from the current domain service.',
    },
    issuer: {
      label: 'Issuer',
      tip: 'Issuer value of the current certificate.',
    },
    certPath: {
      label: 'Certificate path',
      tip: 'Path to the certificate PEM file.',
    },
    keyPath: {
      label: 'Key path',
      tip: 'Path to the corresponding private key PEM file.',
    },
    chainPath: {
      label: 'Certificate chain path',
      tip: 'Path to the file containing certificate chain.',
    },
    lastRenewalSuccess: {
      label: 'Last renewal success',
      tip: 'Date and time of last successful attempt to obtain certificate from Let\'s Encrypt (may be "never").',
    },
    lastRenewalFailure: {
      label: 'Last renewal failure',
      tip: 'Date and time of last unsucessful attempt to obtain certificate from Let\'s Encrypt (may be "never").',
    },
  },
  changedModal: {
    title: 'Important notice',
    submitBtn: {
      enable: 'Enable Let\'s Encrypt',
      disable: 'Disable Let\'s Encrypt',
    },
    text: {
      enableCertWillBeObtained: 'After enabling Let\'s Encrypt, web certificate will be obtained and renewed automatically as necessary for the currently configured domain:',
      enableAgreement: 'By using the Let\'s Encrypt service you agree to the current Let\'s Encrypt Subscriber Agreement:',
      enableReloadInfo: 'The page will be reloaded upon successful certificate installation.',
      disable: 'After disabling Let\'s Encrypt, you will have to manually obtain and set up proper web certificate.',
    },
    cancel: 'Cancel',
  },
};
