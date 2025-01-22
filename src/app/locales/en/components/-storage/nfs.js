export default {
  host: {
    name: 'Hostname',
    tip: 'The hostname (IP address or FQDN) of NFS server.',
  },
  version: {
    name: 'NFS version',
    tip: 'The NFS protocol version. Allowed values are 3 (default) and 4 (experimental).',
  },
  volume: {
    name: 'Volume',
    tip: 'The name (path) of the NFS export.',
  },
  connectionPoolSize: {
    name: 'Connection pool size',
    tip: 'Number of simultaneous network connections that can be maintained with the NFS server.',
  },
  dirCache: {
    name: 'Directory caching',
    tip: 'Enables caching of directory metadata on the client side to improve performance by reducing requests to the NFS server. May cause temporary inconsistencies if the directory content changes on the server.',
    // NOTE: there is no good explanantion of "dircache" parameter from
    // https://github.com/sahlberg/libnfs — the tooltip is no added until someone finds
    // a good one
  },
  readAhead: {
    name: 'Readahead size [B]',
    tip: 'The amount of data that the system preloads into cache ahead of client requests.',
  },
  autoReconnect: {
    name: 'Auto-reconnect attempts',
    tip: 'The number of automatic reconnect attempts to the server. Setting `-1` enables infinite number of reconnects.',
  },
};
