import common from './common';

export default {
  endpoint: {
    label: 'Endpoint',
    tip: 'Full URL of the HTTP server, including scheme (http or https) and path.',
    placeholder: 'Example: https://192.168.1.2:8080/storage',
    regexMessage: 'This field should be a URL with http or https scheme',
  },
  verifyServerCertificate: {
    label: 'Verify server certificate',
    tip: 'Determines whether Oneprovider should verify the certificate of the HTTP server.',
  },
  credentialsType: {
    label: 'Credentials type',
    tip: 'Determines the types of credentials provided in the credentials field.',
    options: {
      none: { label: 'none' },
      basic: { label: 'basic' },
      token: { label: 'token' },
    },
  },
  credentials: {
    label: 'Credentials',
    tip: 'The credentials to authenticate with the HTTP server. "basic" credentials should be provided in the form "username:password", for "token" just the token. In case of "oauth2", this field should contain the username for the HTTP, while the token will be obtained and refreshed automatically in the background. For "none" this field is ignored.',
  },
  onedataAccessToken: {
    label: 'Onedata access token',
    tip: 'When registering a storage backend with the LUMA DB feed set to "auto" and with "OAuth2" external IdP, this field must contain a valid Onedata access token. The token will be used to access the HTTP storage whenever any authorized user accesses any space supported by this storage backend. Consequently, all data access on the storage backend level will be performed on behalf of the token subject.',
  },
  authorizationHeader: {
    label: 'Authorization header',
    tip: 'The authorization header to be used for passing the access token. This field can contain any prefix that should be added to the header value. The token will be placed where "{}" is provided.',
    placeholder: 'Default: Authorization: Bearer {}',
  },
  connectionPoolSize: {
    label: 'Connection pool size',
    tip: 'Defines the maximum number of parallel connections for a single HTTP storage backend.',
    placeholder: 'Default: 150',
  },
  maxRequestsPerSession: {
    label: 'Max requests per session',
    tip: 'Defines the maximum number of requests performed in a single HTTP session. After the limit is reached, "Connection: close" header is sent to the server. When set to 0, number of requests per session is unlimited, unless imposed by the server.',
    placeholder: 'Default: 0',
  },
  fileMode: {
    label: 'Imported file mode',
    tip: 'Defines the file permissions, which files imported from HTTP storage will have in Onedata. Values should be provided in octal format e.g. "0664".',
    placeholder: 'Default: 0664',
    regexMessage: 'This field should be octal POSIX permissions',
  },
  timeout: common.timeout,
};
