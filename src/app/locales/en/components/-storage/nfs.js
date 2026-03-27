import common from './common';

export default {
  host: {
    label: 'Hostname',
    tip: 'The hostname (IP address or FQDN) of NFS server.',
    placeholder: 'Example: nfs.example.com',
  },
  version: {
    label: 'NFS version',
    tip: 'The NFS protocol version. Allowed values are 3 (default) and 4 (experimental).',
    options: {
      3: { label: 'v3' },
      4: { label: 'v4' },
    },
  },
  volume: {
    label: 'Volume',
    tip: 'The label (path) of the NFS export.',
    placeholder: 'Example: /nfs/nfsvolume/',
  },
  connectionPoolSize: {
    label: 'Connection pool size',
    tip: 'Number of simultaneous network connections that can be maintained with the NFS server.',
    placeholder: 'Default: 10',
  },
  dirCache: {
    label: 'Directory caching',
    tip: 'Enables caching of directory metadata on the client side to improve performance by reducing requests to the NFS server. May cause temporary inconsistencies if the directory content changes on the server.',
    // NOTE: there is no good explanantion of "dircache" parameter from
    // https://github.com/sahlberg/libnfs — the tooltip is no added until someone finds
    // a good one
  },
  readAhead: {
    label: 'Readahead size [B]',
    tip: 'The amount of data that the system preloads into cache ahead of client requests.',
    placeholder: 'Default: 0',
  },
  autoReconnect: {
    label: 'Auto-reconnect attempts',
    tip: 'The number of automatic reconnect attempts to the server. Setting `-1` enables infinite number of reconnects.',
    placeholder: 'Default: 1',
  },
  timeout: common.timeout,
};
