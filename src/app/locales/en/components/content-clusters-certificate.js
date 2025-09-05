import { certDocsLink } from './-certificates';

export default {
  header: 'Web certificate',
  formTitleStatic: 'Web certificate details',
  forceRenewCertBtn: 'Force renewal now',
  renewCertBtn: 'Renew certificate',
  toRenewIt: 'To renew it, you can:',
  toRenewLi1: 'install a new certificate manually',
  toRenewLi2: 'enable Let\'s Encrypt for automatic renewal',
  autoRenewalLetsEncrypt: 'It will be renewed automatically using the Let\'s Encrypt service. Alternatively, you can force renewal with button below.',
  wrongDomainCommon: 'The installed certificate does not match the domain of the cluster.',
  certDocsLink,
  nearExpirationCommon: 'Your certificate expires on',
  expiredCommon: 'Your certificate has expired on',
  regenerating: 'New certificate is being obtained from Let\'s Encrypt...',
  labels: {
    letsEncrypt: 'Let\'s Encrypt',
    expirationTime: 'Expiration time',
    creationTime: 'Creation time',
    domain: 'Domain',
    issuer: 'Issuer',
    paths: {
      cert: 'Certificate path',
      key: 'Key path',
      chain: 'Certificate chain path',
    },
  },
  renewingWebCert: 'renewing web certificate',
  noS3Domain: 'This Oneprovider has S3 data access protocol support enabled, but the web certificate does not include a domain matching the "s3.*" pattern. You must include such a domain in the certificate\'s Subject Alternative Name (SAN) extension to enable the S3 data access protocol.',
};
