export default {
  endpoint: {
    name: 'Endpoint',
    tip: 'Full URL of the HTTP server, including scheme (http or https) and path.',
  },
  credentialsType: {
    name: 'Credentials type',
    tip: 'Determines the types of credentials provided in the credentials field.',
  },
  credentials: {
    name: 'Credentials',
    tip: 'The credentials to authenticate with the HTTP server. "basic" credentials should be provided in the form "username:password", for "token" just the token. In case of "oauth2", this field should contain the username for the HTTP, while the token will be obtained and refreshed automatically in the background. For "none" this field is ignored.',
  },
  oauth2IdP: {
    name: 'OAuth2 IdP',
    tip: 'In case "oauth2" credential type is selected and Onezone is configured with support for multiple external IdP\'s, this field must contain the name of the IdP which authenticates requests to the HTTP endpoint. If Onezone has only one external IdP, it will be selected automatically.',
  },
  onedataAccessToken: {
    name: 'Onedata access token',
    tip: 'When registering storage backend with feed of LUMA DB set to "auto" and with "OAuth2" external IdP, this field must contain a valid Onedata access token of the user on whose behalf the HTTP storage will be accessed by all users with access to any space supported by this storage.',
  },
  verifyServerCertificate: {
    name: 'Verify server certificate',
    tip: 'Determines whether Oneprovider should verify the certificate of the HTTP server.',
  },
  authorizationHeader: {
    name: 'Authorization header',
    tip: 'The authorization header to be used for passing the access token. This field can contain any prefix that should be added to the header value. Default is "Authorization: Bearer {}". The token will be placed where "{}" is provided.',
  },
  connectionPoolSize: {
    name: 'Connection pool size',
    tip: 'Defines the maximum number of parallel connections for a single HTTP storage backend. Default: 25.',
  },
  maxRequestsPerSession: {
    name: 'Max requests per session',
    tip: 'Defines the maximum number of requests performed in a single HTTP session. After the limit is reached, "Connection: close" header is sent to the server. When set to 0, number of requests per session is unlimited, unless imposed by the server. Default: 0.',
  },
  fileMode: {
    name: 'File mode',
    tip: 'Defines the file permissions, which files imported from HTTP storage will have in Onedata. Values should be provided in octal format e.g. "0664". Default: 0664.',
  },
  timeout: { name: 'Timeout [ms]' },
};
