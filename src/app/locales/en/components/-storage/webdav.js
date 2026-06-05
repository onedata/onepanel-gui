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
    label: 'Credentials',
    tip: 'Determines what credentials will be used to authorize access to the WebDAV storage backend. For public endpoints, select "none".',
    options: {
      none: { label: 'none' },
      basic: { label: 'basic' },
      token: { label: 'token' },
    },
    additionalButton: {
      name: 'Overwrite',
      tooltip: 'Lets you provide new credentials (the type and values), while the previous credentials are cleared. The change is not applied until you save the whole form.',
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
  onedataAccessToken: {
    label: 'API/access token',
    tip: 'A token specific for this storage backend that will be used to authorize data access operations.',
  },
  authorizationHeader: {
    label: 'Authorization header',
    tip: 'Header format for passing the API/access token to the backend storage server. The token will be inserted in place of "{}". Use a colon to separate the header name and value, e.g. "X-API-Token: {}".',
    placeholder: 'Default: Authorization: Bearer {}',
  },
  rangeWriteSupport: {
    label: 'Range write support',
    tip: 'Select the mechanism used for range writes (partial/random-access writes). Since the Onedata filesystem permits partial file modifications, writable supports require a storage backend that implements the selected method. Standard WebDAV does not support range writes and only provides write-once semantics.',
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
    lockHintNoneDisabled: 'Writable storage backends require a range write method to support partial file modifications. Otherwise, the storage backend must be configured as read-only.',
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
