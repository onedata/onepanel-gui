export default {
  host: {
    name: 'Hostname',
    tip: 'The hostname (IP address or FQDN) of NFS server.',
  },
  version: {
    name: 'Version',
    tip: 'The NFS protocol version. Allowed values are 3 (default) and 4 (experimental).',
  },
  volume: {
    name: 'Volume',
    tip: 'The name of the NFS volume (export).',
  },
  connectionPoolSize: {
    name: 'Connection pool size',
    tip: 'The size of NFS connection pool. Default: 10.',
  },
  dirCache: {
    name: 'Directory caching',
    tip: 'Enables directory caching.',
  },
  readAhead: {
    name: 'Readahead size [B]',
    tip: 'The size of readahead in bytes. Default: 0.',
  },
  autoReconnect: {
    name: 'Auto-reconnect attempts',
    tip: 'The number of automatic reconnect attempts to the server. Setting `-1` enables infinite number of reconnects. Default: 1.',
  },
};
