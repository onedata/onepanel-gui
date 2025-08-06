import common from './common';

export default {
  url: {
    label: 'URL',
    tip: 'Full URL of the XRootD server, including scheme (root or http) and path, e.g. "root://192.168.0.1//data". Please note, that XRootD URL format requires double slash after host to indicate absolute path.',
    placeholder: 'Example: root://192.168.0.1//data',
    regexMessage: 'This field should be a URL with http, https or root scheme',
  },
  fileModeMask: {
    label: 'Imported file mode mask',
    tip: 'Defines the file permissions mask, which is used to map XRootD file mode to POSIX mode. For instance a mask "0664" for readable file on XRootD would result in a file which is readable for all users, but file which is writeable in XRootD will be only writeable by user and group.',
    placeholder: 'Default: 0664',
    regexMessage: 'This field should be octal POSIX permissions',
  },
  dirModeMask: {
    label: 'Imported directory mode mask',
    tip: 'Defines the directory permissions mask, which is used to map XRootD dir mode to POSIX mode. For instance a mask "0770" for readable directory on XRootD would result in a directory which is readable for owner and group but not for others.',
    placeholder: 'Default: 0775',
    regexMessage: 'This field should be octal POSIX permissions',
  },
  credentialsType: {
    label: 'Credentials type',
    tip: 'Determines the types of credentials provided in the credentials field. Default: none.',
    options: {
      none: {
        label: 'none',
      },
      pwd: {
        label: 'password',
      },
    },
  },
  credentials: {
    label: 'Credentials',
    tip: 'The credentials to authenticate with the XRootD server. For "password" credentials type, this field should contain simply user and password, e.g. "admin:password". For "none" this field is ignored.',
    placeholder: 'Example: username:password',
  },
  timeout: common.timeout,
};
