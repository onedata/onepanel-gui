export default {
  url: {
    name: 'URL',
    tip: 'Full URL of the XRootD server, including scheme (root or http) and path, e.g. "root://192.168.0.1//data". Please note, that XRootD URL format requires double slash after host to indicate absolute path.',
  },
  fileModeMask: {
    name: 'File mode mask',
    tip: 'Defines the file permissions mask, which is used to map XRootD file mode to POSIX mode. For instance a mask "0664" for readable file on XRootD would result in a file which is readable for all users, but file which is writeable in  RootD will be only writeable by user and group. Default: "0664".',
  },
  dirModeMask: {
    name: 'Directory mode mask',
    tip: 'Defines the file permissions mask, which is used to map XRootD file mode to POSIX mode. For instance a fileModeMask "0664" for readable file on XRootD would result in a file which is readable for all users, but file which is writeable in XRootD will be only writeable by user and group. Default: "0775"',
  },
  credentialsType: {
    name: 'Credentials type',
    tip: 'Determines the types of credentials provided in the credentials field. Default: none.',
  },
  credentials: {
    name: 'Credentials',
    tip: 'The credentials to authenticate with the XRootD server. For "password" credentials type, this field should contain simply user and password, e.g. "admin:password". For "none" this field is ignored.',
  },
  timeout: { name: 'Timeout [ms]' },
};
