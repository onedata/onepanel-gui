export default {
  endpoint: {
    label: 'Endpoint',
    tip: 'Base URL of the HTTP server, including scheme ("http" or "https") and optional path prefix. When registering files by relative path in "storageFileId", that path is appended to this URL. <strong> Note: </strong> A full URI supplied as "storageFileId" always takes precedence and bypasses this endpoint, allowing files from any HTTP server reachable by the Oneprovider to be registered.',
    placeholder: 'Example: https://192.168.1.2:8080/storage',
    regexMessage: 'This field should be a URL with http or https scheme',
  },
  verifyServerCertificate: {
    label: 'Verify server certificate',
    tip: 'Determines whether Oneprovider should verify the certificate of the HTTP server.',
  },
  credentialsType: {
    label: 'Credentials',
    tip: 'Determines the types of credentials provided in the credentials field.',
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
  username: {
    label: 'Username',
  },
  password: {
    label: 'Password',
  },
  credentials: {
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
  emulateRangeRead: {
    label: 'Emulate range read',
    tip: 'Enables fallback emulation of range reads for HTTP servers that do not support the "Range" header. When active, the full file content is downloaded and only the requested byte range is returned to the caller. Has no effect on servers that support range reads natively. <strong>Warning:</strong> Emulation causes significant performance degradation and increased memory usage; enable only as a last resort.',
  },
  maxEmulatedRangeReadFileSize: {
    label: 'Max emulated range read file size',
    tip: 'Maximum file size in bytes eligible for emulated range reads. Files exceeding this limit cannot be accessed from servers that lack native range read support.Has no effect unless "emulateRangeRead" is "true".',
  },
};
