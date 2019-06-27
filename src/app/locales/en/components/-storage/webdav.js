export default {
  endpoint: {
    name: 'Endpoint',
    tip: 'Full URL of the WebDAV server, e.g. https://example.com:8080/webdav',
  },
  verifyServerCertificate: {
    name: 'Verify server certificate',
    tip: 'Determines whether Oneprovider should verify the certificate of the WebDAV server. Default: true.',
  },
  credentialsType: {
    name: 'Credentials type',
    tip: 'Determines the types of credentials provided in the credentials field. Default: none.',
  },
  credentials: {
    name: 'Credentials',
    tip: 'The credentials to authenticate with the WebDAV server. "basic" credentials should be provided in the form "username:password", for "token" just the token. In case of "oauth2", this field should contain the username for the WebDAV, while the token will be obtained and refreshed automatically in the background. For "none" this field is ignored.',
  },
  oauth2IdP: {
    name: 'OAuth2 IdP',
    tip: 'In case "oauth2" credential type is selected and Onezone is configured with support for multiple external IdP\'s, this field must contain the name of the IdP which authenticates requests to the WebDAV endpoint. If Onezone has only one external IdP, it will be selected automatically.',
  },
  onedataAccessToken: {
    name: 'Onedata access token',
    tip: 'When registering storage in "insecure" mode with "OAuth2" external IdP, this field must contain a valid Onedata access token of the user on whose behalf the WebDAV storage will be accessed by all users with access to any space supported by this storage.',
  },
  authorizationHeader: {
    name: 'Authorization header',
    tip: 'The authorization header to be used for passing the access token. This field can contain any prefix that should be added to the header value. Default is  "Authorization: Bearer {}". The token will be placed where "{}" is provided.',
  },
  rangeWriteSupport: {
    name: 'Range write support',
    tip: 'The type of partial write support enabled in the WebDAV server. Currently two types are supported: "sabredav" which assumes the server supports the SabreDAV PartialUpdate extension via PATCH method, and "moddav" which assumes server supports partial PUT requests with Content-Range header. If "none" is selected no write support is available for this WebDAV storage.',
  },
  connectionPoolSize: {
    name: 'Connection pool size',
    tip: 'Defines the maximum number of parallel connections for a single WebDAV storage. Default: 0.',
  },
  maximumUploadSize: {
    name: 'Maximum upload size [b]',
    tip: 'Defines the maximum upload size for a single PUT or PATCH request. If set to 0, assumes that the WebDAV server has no upload limit. Default: 0.',
  },
  fileMode: {
    name: 'File mode',
    tip: 'Defines the file permissions, which files imported from WebDAV storage will have in Onedata. Values should be provided in octal format e.g. "0644". Default: 0644.',
  },
  dirMode: {
    name: 'Directory mode',
    tip: 'Defines the directory mode which directories imported from WebDAV storage will have in Onedata. Values should be provided in octal format e.g. "0775".  Default: 0775.',
  },
  timeout: { name: 'Timeout [ms]' },
  insecure: {
    name: 'Insecure',
    tip: 'Defines whether storage administrator credentials (username and key) may be used by users without storage accounts to access storage in direct IO mode.',
  },
};
