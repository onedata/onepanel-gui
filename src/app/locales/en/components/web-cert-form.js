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
      left: ' left',
      warningTipNearExpiration: 'This certificate expires soon, it should be renewed as soon as possible.',
      warningTipExpired: 'This certificate has expired, it should be renewed as soon as possible.',
    },
    creationTime: {
      label: 'Creation time',
      tip: 'Installed certificate\'s creation time.',
    },
    dnsNames: {
      label: 'DNS names',
      tip: 'List of DNS names included in certificate\'s Subject Alternative Name extension.',
      warningTip: 'None of the certificate\'s DNS names matches the configured {{currentServiceType}} domain ({{currentDomain}}). Until this problem is resolved, HTTPS connections to the service will be considered insecure and the Web UI may malfunction.',
      noneMatchWarning: 'None of the above match the service domain.',
      noS3DomainWarningText: 'No DNS name matching the "s3" subdomain.',
      noS3DomainWarningTip: 'This Oneprovider has S3 data access protocol support enabled, but the web certificate does not include a domain matching the "s3" subdomain. You must include such a domain in the certificate\'s Subject Alternative Name (SAN) extension, either as a literal DNS name (s3.{{currentDomain}}) or as a wildcard DNS name (*.{{currentDomain}}).',
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
      never: 'never',
    },
    lastRenewalFailure: {
      label: 'Last renewal failure',
      tip: 'Date and time of last unsucessful attempt to obtain certificate from Let\'s Encrypt (may be "never").',
      never: 'never',
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
