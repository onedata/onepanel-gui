export default {
  endpoint: {
    label: 'Endpoint',
    tip: 'Full URL of the WebDAV server, e.g. https://example.com:8080/webdav',
    placeholder: 'Example: https://192.168.1.2:8080/webdav',
    regexMessage: 'This field should be a URL with http or https scheme',
  },
  verifyServerCertificate: {
    label: 'Verify server certificate',
    tip: 'Determines whether Oneprovider should verify the certificate of the WebDAV server. Default: true.',
  },
  credentialsType: {
    label: 'Credentials type',
    tip: 'Determines the types of credentials provided in the credentials field. Default: none.',
    options: {
      none: { label: 'none' },
      basic: { label: 'basic' },
      token: { label: 'token' },
      oauth2: { label: 'OAuth2' },
    },
  },
  credentials: {
    label: 'Username',
    tip: 'The credentials to authenticate with the WebDAV server. This field should contain the username for the WebDAV, while the token will be obtained and refreshed automatically in the background.',
  },
  username: {
    label: 'Username',
  },
  password: {
    label: 'Password',
  },
  oauth2IdP: {
    label: 'OAuth2 IdP',
    tip: 'In case "oauth2" credential type is selected and Onezone is configured with support for multiple external IdP\'s, this field must contain the label of the IdP which authenticates requests to the WebDAV endpoint. If Onezone has only one external IdP, it will be selected automatically.',
  },
  onedataAccessToken: {
    label: 'Onedata access token',
    tip: 'When registering a storage backend with the LUMA DB feed set to "auto" and with "OAuth2" external IdP, this field must contain a valid Onedata access token. The token will be used to access the WebDAV storage whenever any authorized user accesses any space supported by this storage backend. Consequently, all data access on the storage backend level will be performed on behalf of the token subject.',
  },
  authorizationHeader: {
    label: 'Authorization header',
    tip: 'The authorization header to be used for passing the access token. This field can contain any prefix that should be added to the header value. The token will be placed where "{}" is provided.',
    placeholder: 'Default: Authorization: Bearer {}',
  },
  rangeWriteSupport: {
    label: 'Range write support',
    tip: 'Required for write-enabled supports; the storage backend must support at least one range write method. The baseline WebDAV protocol does not support range writes and only allows a write-once approach, which is incompatible with the Onedata filesystem, as it permits partial file modifications.',
    options: {
      none: { label: 'none' },
      sabredav: {
        label: 'SabreDAV',
        tip: 'Assumes the server supports the SabreDAV PartialUpdate extension via PATCH method.',
      },
      moddav: {
        label: 'ModDAV',
        tip: 'Assumes the server supports partial PUT requests with Content-Range header.',
      },
    },
    lockHintNoneDisabled: 'Write support requires specifying the range write method for the storage backend; otherwise, the storage must be configured as readonly.',
    lockHintAllDisabled: 'Range writes are not applicable for read-only storage backends.',
  },
  connectionPoolSize: {
    label: 'Connection pool size',
    tip: 'Defines the maximum number of parallel connections for a single WebDAV storage backend.',
    placeholder: 'Default: 25',
  },
  maximumUploadSize: {
    label: 'Maximum upload size [b]',
    tip: 'Defines the maximum upload size for a single PUT or PATCH request. If set to 0, assumes that the WebDAV server has no upload limit.',
    placeholder: 'Default: 0',
  },
  fileMode: {
    label: 'Imported file mode',
    tip: 'Defines the file permissions, which files imported from WebDAV storage will have in Onedata. Values should be provided in octal format e.g. "0664".',
    placeholder: 'Default: 0664',
    regexMessage: 'This field should be octal POSIX permissions',
  },
  dirMode: {
    label: 'Imported directory mode',
    tip: 'Defines the directory mode which directories imported from WebDAV storage will have in Onedata. Values should be provided in octal format e.g. "0775".',
    placeholder: 'Default: 0775',
    regexMessage: 'This field should be octal POSIX permissions',
  },
};
