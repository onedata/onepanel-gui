export default {
  submit: 'Modify certificate settings',
  fields: {
    letsEncrypt: {
      label: 'Use Let\'s Encrypt',
      tip: 'If enabled, the certificate is obtained from Let\'s Encrypt service and renewed automatically. Otherwise, the certificate management is up to the administrator.',
    },
    expirationTime: {
      label: 'Expiration time',
      tip: 'Installed certificate\'s expiration time.',
    },
    creationTime: {
      label: 'Creation time',
      tip: 'Installed certificate\'s creation time.',
    },
    domain: {
      label: 'Domain',
      tip: 'The domain (Common Name) for which current certificate was issued.',
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
      tip: 'Date and time in ISO 8601 format. Represents last successful attempt to obtain certificate from Let\'s Encrypt. If there are no successful attempts its value is null. This property is omitted if Let\'s Encrypt is off.',
    },
    lastRenewalFailure: {
      label: 'Last renewal failure',
      tip: 'Date and time in ISO 8601 format. Represents last unsucesfful attempt to obtain certificate from Let\'s Encrypt. If there are no successful attempts its value is null. This property is omitted if Let\'s Encrypt is off.',
    },
  },
};
