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
};
