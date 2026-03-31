const s3LockedImportedReadonlyCanonicalTip =
  'S3 storage with canonical paths as object names can only be used in readonly mode for import, since S3 does not support random access writes, which is required to support Onedata writes. On S3, each write has to replace the entire object.';
const s3LockedImportedReadonlyFlatTip =
  'S3 storage with flat object names cannot be imported (which would imply readonly mode), as no file/directory structure can be inferred.';

export default {
  name: { label: 'Name' },
  storagePathType: {
    label: 'Storage path type',
    options: {
      flat: {
        label: 'flat',
      },
      canonical: {
        label: 'canonical',
      },
    },
    tip: 'Determines the type of file path mapping on this storage backend. Flat paths ' +
      'are based solely on unique identifiers internal to Onedata and do not ' +
      'require modification for rename operations, canonical paths resemble ' +
      'POSIX-style directory structure reflecting the logical space directory tree.',
  },
  readonly: {
    label: 'Readonly',
    tip: 'Defines whether the storage backend is readonly. If enabled, Oneprovider will block any operation that writes, modifies or deletes data on the storage backend. Such storage backend can only be used to import data into the space. Mandatory to ensure proper behaviour if the backend storage is actually configured as readonly.',
    httpOnlyReadonlyTip: 'HTTP storage backends are limited to readonly mode.',
    s3LockedFlatTip: s3LockedImportedReadonlyFlatTip,
    s3LockedCanonicalTip: s3LockedImportedReadonlyCanonicalTip,
    lockedTip: 'This option is available only for imported storage backends.',
  },
  importedStorage: {
    label: 'Imported storage',
    tip: 'Indicates that the existing data on this storage backend is intended for import. Actual data import will happen when the storage backend is used to support a space. Only one space can be supported by such storage backend.',
    httpOnlyImported: 'HTTP storage backends are always treated as imported due to their readonly limitation.',
    s3LockedFlatTip: s3LockedImportedReadonlyFlatTip,
    s3LockedCanonicalTip: s3LockedImportedReadonlyCanonicalTip,
  },
  lumaFeed: {
    label: 'LUMA feed',
    tip: `
      <p class="text-center">Determines the way in which Local User Mapping database (LUMA DB) will be filled.</p>
      <p class="text-left"><strong>auto</strong> ‐ User mappings will be determined by automatic algorithm.</p>
      <p class="text-left"><strong>local</strong> ‐ User mappings should be directly set in LUMA DB by space administrator using REST API.</p>
      <p class="text-left"><strong>external</strong> ‐ External, 3rd party service will be queried for user mappings.</p>
    `,
    options: {
      auto: {
        label: 'auto',
      },
      local: {
        label: 'local',
      },
      external: {
        label: 'external',
      },
    },
  },
  timeout: {
    label: 'Timeout [ms]',
    placeholder: 'Default: 300000',
    tip: 'Maximum time to wait for a response from the storage service before the request is aborted.',
  },
  type: {
    label: 'Type',
    options: {
      cephrados: {
        label: 'Ceph RADOS',
      },
      ceph: {
        label: 'Ceph (deprecated)',
      },
      posix: {
        label: 'POSIX',
      },
      nfs: {
        label: 'NFS',
      },
      s3: {
        label: 'S3',
      },
      swift: {
        label: 'Swift',
      },
      glusterfs: {
        label: 'GlusterFS',
      },
      webdav: {
        label: 'WebDAV',
      },
      http: {
        label: 'HTTP',
      },
      xrootd: {
        label: 'XRootD',
      },
      nulldevice: {
        label: 'Null Device',
      },
    },
  },
};
