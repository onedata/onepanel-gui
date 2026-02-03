import { expect } from 'chai';
import { describe, it, context } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, fillIn, settled, find, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import _ from 'lodash';
import { resolve } from 'rsvp';
import sinon from 'sinon';
import FormHelper from '../../helpers/form';
import { selectChoose } from 'ember-power-select/test-support/helpers';

class ClusterStorageAddHelper extends FormHelper {
  constructor(template) {
    super(template, '.cluster-storage-add-form');
  }
}

const POSIX_TYPE = {
  id: 'posix',
  name: 'POSIX',
};

const CEPH_RADOS_TYPE = {
  id: 'cephrados',
  name: 'Ceph RADOS',
};

const S3_TYPE = {
  id: 's3',
  name: 'S3',
};

const HTTP_TYPE = {
  id: 'http',
  name: 'HTTP',
};

const POSIX_STORAGE = {
  type: 'posix',
  id: 'storage1_verylongid',
  storagePathType: 'canonical',
  importedStorage: true,
  mountPoint: '/mnt/st1',
  lumaFeed: 'external',
  lumaFeedUrl: 'http://some.url.com',
  lumaFeedApiKey: 'someapikey',
  rootUid: '1000',
  rootGid: '1001',
  timeout: 20,
  readonly: true,
  name: 'Some POSIX storage',
};

const CEPH_RADOS_STORAGE = {
  type: 'cephrados',
  name: 'cephrados_id',
  storagePathType: 'flat',
  importedStorage: true,
  readonly: false,
  lumaFeed: 'local',
  username: 'admin',
  key: 'key1',
  monitorHostname: 'monitor.example.com',
  clusterName: 'ceph_cluster',
  poolName: 'pool1',
  blockSize: 20,
};

const NFS_STORAGE = {
  type: 'nfs',
  name: 'nfs_id',
  storagePathType: 'canonical',
  importedStorage: true,
  readonly: true,
  lumaFeed: 'auto',
  host: 'nfs.example.com',
  version: '3',
  volume: '/nfs/nfsvolume/',
  connectionPoolSize: '10',
  dirCache: true,
  readAhead: '0',
  autoReconnect: '1',
};

const S3_STORAGE = {
  type: 's3',
  name: 's3_id',
  storagePathType: 'canonical',
  importedStorage: true,
  readonly: true,
  lumaFeed: 'local',
  hostname: 'https://s3.example.com',
  bucketName: 'name',
  verifyServerCertificate: true,
  region: 'us-east-1',
  accessKey: 'admin',
  fileMode: '0664',
  dirMode: '0775',
};

const SWIFT_STORAGE = {
  type: 'swift',
  name: 'swift_id',
  storagePathType: 'flat',
  importedStorage: false,
  readonly: false,
  lumaFeed: 'local',
  username: 'admin',
  password: 'password',
  projectName: 'name',
  userDomainName: 'Default',
  projectDomainName: 'Default',
  authUrl: 'https://auth.example.com:5000/v3',
  containerName: 'container',
  blockSize: '20',
};

const GLUSTERFS_STORAGE = {
  type: 'glusterfs',
  name: 'glusterfs_id',
  storagePathType: 'canonical',
  importedStorage: false,
  readonly: false,
  lumaFeed: 'local',
  volume: 'volume',
  hostname: 'dss',
  port: '24007',
  transport: 'tcp',
  mountPoint: 'mountpoint',
  xlatorOptions: 'fsf',
};

const WEBDAV_STORAGE = {
  type: 'webdav',
  name: 'webdav_id',
  storagePathType: 'canonical',
  importedStorage: false,
  readonly: false,
  lumaFeed: 'local',
  endpoint: 'https://192.168.1.2:8080/webdav',
  verifyServerCertificate: true,
  credentialsType: 'oauth2',
  credentials: 'username:password',
  oauth2IdP: 'fds',
  rangeWriteSupport: 'moddav',
  connectionPoolSize: '10',
  maximumUploadSize: '0',
  fileMode: '0664',
  dirMode: '0775',
};

const HTTP_STORAGE = {
  name: 'Some Apache',
  verifyServerCertificate: false,
  type: 'http',
  storagePathType: 'canonical',
  readonly: true,
  qosParameters: {
    storageId: 'e777476baf3418ed9861a97750be285ech9802',
    providerId: '94ba8a6cf8d6c598c856c4ee78d506f0ch487e',
  },
  lumaFeed: 'auto',
  importedStorage: true,
  id: 'e777476baf3418ed9861a97750be285ech9802',
  endpoint: 'http://172.17.0.3',
  credentialsType: 'token',
  maxRequestsPerSession: 3,
  connectionPoolSize: 150,
  authorizationHeader: 'Authorization: Bearer {}',
  onedataAccessToken: '1234567890abcdef',
};

const XROOTD_STORAGE = {
  type: 'xrootd',
  name: 'xrootd_id',
  storagePathType: 'canonical',
  importedStorage: false,
  readonly: false,
  lumaFeed: 'auto',
  url: 'root://192.168.0.1//data',
  fileModeMask: '0664',
  dirModeMask: '0775',
  credentialsType: 'pwd',
  credentials: 'username:password',
};

const NULL_DEVICE_STORAGE = {
  type: 'nulldevice',
  name: 'nulldevice_id',
  storagePathType: 'canonical',
  importedStorage: true,
  readonly: true,
  lumaFeed: 'local',
  latencyMin: '10',
  latencyMax: '100',
  timeoutProbability: '0.1',
  filter: '*',
  simulatedFilesystemParameters: '2-3:4-5:512',
  simulatedFilesystemGrowSpeed: '100',
  timeout: '20',
};

async function testAllowCertainPathTypeCreate({
  allow,
  pathType,
  type,
}) {
  const allowText = allow ? 'allows' : 'does not allow';
  it(`${allowText} to set "${pathType}" path type of storage with type "${type}"`,
    async function () {
      this.set('mode', 'create');
      await render(hbs`<ClusterStorageAddForm @mode={{mode}} />`);
      await selectChoose('.type-field .dropdown-field', type);

      if (allow) {
        const pathTypeInput = `.storagePathType-field .option-${pathType} input`;
        await click(pathTypeInput);
        expect(find(pathTypeInput)).to.have.property('checked', true);
      } else {
        expect(find('.storagePathType-field .one-way-radio-group'))
          .to.have.class('disabled');
      }
    }
  );
}

async function checkForStorageDetailsInShowMode(type, storage, fieldCount) {
  it(`shows storage details for ${type} type`, async function () {
    this.set('storage', storage);
    await render(hbs `<ClusterStorageAddForm @storage={{storage}} @mode="show" />`);

    expect(findAll('.form-group:has(>label)')).to.have.length(fieldCount);

    Object.entries(storage).forEach(([key, value]) => {
      if (key === 'type') {
        expect(find('.type-field')).to.contain.text(type);
      } else if (typeof value === 'boolean') {
        const toggle = find(`.${key}-field .one-way-toggle`);
        if (value) {
          expect(toggle).to.have.class('checked');
        } else {
          expect(toggle).to.have.class('unselected');
        }
      } else if (key !== 'id' && key !== 'qosParameters') {
        let expectedValue = String(value);

        if (key === 'version') {
          expectedValue = String('v' + value);
        } else if (key === 'transport') {
          expectedValue = String(value).toUpperCase();
        } else if (key === 'credentialsType' && value === 'oauth2') {
          expectedValue = 'OAuth2';
        } else if (key === 'credentialsType' && value === 'pwd') {
          expectedValue = 'password';
        } else if (key === 'rangeWriteSupport' && value === 'moddav') {
          expectedValue = 'ModDAV';
        }

        expect(find(`.${key}-field`)).to.contain.text(expectedValue);
      }
    });
  });
}

async function checkForStorageDetailsInEditMode(type, storage, fieldCount) {
  it(`shows storage details for ${type} type`, async function () {
    this.set('storage', storage);
    await render(hbs`<ClusterStorageAddForm @storage={{storage}} @mode="edit" />`);

    expect(findAll('.form-group:has(>label)')).to.have.length(fieldCount);

    Object.entries(storage).forEach(([key, value]) => {
      if (key === 'type') {
        expect(find('.type-field .field-component')).to.contain.text(type);
        expect(find('.type-field .dropdown-field')
            .querySelectorAll('.dropdown-field-trigger'))
          .to.have.length(0);
      } else if (typeof value === 'boolean') {
        const toggle = find(`.${key}-field .one-way-toggle`);

        if (value) {
          expect(toggle).to.have.class('checked');
        } else {
          expect(toggle).to.have.class('unselected');
        }
      } else if (key !== 'id' && key !== 'qosParameters') {
        if (
          [
            'blockSize', 'storagePathType', 'onedataAccessToken',
            'oauth2IdP', 'fileModeMask', 'dirModeMask',
          ].includes(key) ||
          (type !== 'S3' && (key === 'fileMode' || key === 'dirMode'))
        ) {
          expect(find(`.${key}-field`).querySelector('input')).to.not.exist;
          expect(find(`.${key}-field .field-component`))
            .to.contain.text(String(value));
        } else if (
          key === 'credentialsType' ||
          key === 'lumaFeed' ||
          key === 'rangeWriteSupport' ||
          key === 'version' ||
          key === 'transport'
        ) {
          const input = find(`.${key}-field .option-${value} input`);
          expect(input).to.have.value(value);
          expect(input).to.have.property('checked', true);
        } else {
          const element = find(`.${key}-field`);
          expect(element).to.exist;
          expect(element.querySelector('input')).to.exist;
          expect(find(`.${key}-field input`)).to.have.value(String(value));
        }
      }
    });
  });
}

async function checkForStorageDetailsInCreateMode(type, fieldCount) {
  it(`shows storage details for ${type} type`, async function () {
    await render(hbs`<ClusterStorageAddForm @mode="create" />`);
    await selectChoose('.type-field .dropdown-field', type);
    expect(findAll('.form-group:has(>label)')).to.have.length(fieldCount);
  });
}

describe('Integration | Component | cluster-storage-add-form', function () {
  setupRenderingTest();

  context('in show mode', function () {
    checkForStorageDetailsInShowMode('POSIX', POSIX_STORAGE, 12);
    checkForStorageDetailsInShowMode('Ceph RADOS', CEPH_RADOS_STORAGE, 12);
    checkForStorageDetailsInShowMode('NFS', NFS_STORAGE, 13);
    checkForStorageDetailsInShowMode('S3', S3_STORAGE, 15);
    checkForStorageDetailsInShowMode('Swift', SWIFT_STORAGE, 14);
    checkForStorageDetailsInShowMode('GlusterFS', GLUSTERFS_STORAGE, 12);
    checkForStorageDetailsInShowMode('WebDAV', WEBDAV_STORAGE, 16);
    checkForStorageDetailsInShowMode('HTTP', HTTP_STORAGE, 13);
    checkForStorageDetailsInShowMode('XRootD', XROOTD_STORAGE, 11);
    checkForStorageDetailsInShowMode('Null Device', NULL_DEVICE_STORAGE, 13);

  });

  context('in create mode', function () {
    checkForStorageDetailsInCreateMode('POSIX', 10);
    checkForStorageDetailsInCreateMode('Ceph RADOS', 13);
    checkForStorageDetailsInCreateMode('NFS', 13);
    checkForStorageDetailsInCreateMode('S3', 18);
    checkForStorageDetailsInCreateMode('Swift', 15);
    checkForStorageDetailsInCreateMode('GlusterFS', 13);
    checkForStorageDetailsInCreateMode('WebDAV', 15);
    checkForStorageDetailsInCreateMode('HTTP', 13);
    checkForStorageDetailsInCreateMode('XRootD', 11);
    checkForStorageDetailsInCreateMode('Null Device', 13);

    /**
     * Test against a strange bug that occured when automatically changed readonly toggle
     * @param {{ id: String, name: String }} targetStorageType
     */
    function runNameValidationLockTest(targetStorageType) {
      it(
        `does not block name input by validation after immediate storage type change to ${targetStorageType.name}`,
        async function () {
          await render(hbs`<ClusterStorageAddForm />`);
          await selectChoose('.type-field .dropdown-field', CEPH_RADOS_TYPE.name);

          await selectChoose('.type-field .dropdown-field', targetStorageType.name);
          await settled();
          await fillIn('.name-field input', 'hello');

          expect(find('.has-error'), 'error indicator').to.not.exist;
        }
      );
    }

    runNameValidationLockTest(POSIX_TYPE);
    runNameValidationLockTest(HTTP_TYPE);

    it('renders fields for POSIX storage type if "posix" is selected',
      async function () {
        await render(hbs`<ClusterStorageAddForm />`);
        await selectChoose('.type-field .dropdown-field', POSIX_TYPE.name);

        expect(findAll('.form-group:has(>label)')).to.have.length(10);
        expect(find('.type-field')).to.contain.text('POSIX');
        [
          'name',
          'mountPoint',
          'rootUid',
          'rootGid',
          'timeout',
        ].forEach((fieldName) => {
          const element = find(`.${fieldName}-field`);
          expect(element).to.exist;
          expect(element.querySelector('input')).to.exist;
        });
        expect(find('.storagePathType-field .one-way-radio-group'))
          .to.have.class('disabled');
        expect(find('.storagePathType-field .option-canonical input'))
          .to.have.property('checked', true);

        expect(find('.importedStorage-field .one-way-toggle')).to.have.class('unselected');
        expect(find('.readonly-field .one-way-toggle')).to.have.class('unselected');
        expect(find('.readonly-field .one-way-toggle')).to.have.class('disabled');

        expect(find('.lumaFeed-field .one-way-radio-group')).to.exist;
        expect(find('.lumaFeed-field .one-way-radio-group')
            .querySelectorAll('input[type="radio"]'))
          .to.have.length(3);
        expect(find('.lumaFeed-field .option-auto input'))
          .to.have.property('checked', true);
      }
    );

    it('does not submit empty values for posix', async function () {
      let submitOccurred = false;
      this.setProperties({
        submit: (formData) => {
          submitOccurred = true;
          expect(formData).to.have.property('name');
          expect(formData.name).to.be.equal('some name');
          expect(formData.importedStorage).to.be.false;
          expect(formData).to.have.property('lumaFeed');
          expect(formData.lumaFeed).to.equal('auto');
          expect(formData).to.have.property('mountPoint');
          expect(formData.mountPoint).to.be.equal('/mnt/st1');
          expect(formData).to.not.have.property('timeout');
          return resolve();
        },
      });

      await render(hbs `
        <ClusterStorageAddForm
          @onSubmit={{submit}}
        />
      `);
      await selectChoose('.type-field .dropdown-field', POSIX_TYPE.name);

      await fillIn('.name-field input', 'some name');
      await fillIn('.mountPoint-field input', '/mnt/st1');
      await find('button[type="submit"]').click();
      expect(submitOccurred).to.be.true;
    });

    it('shows and hides luma fields', async function () {
      await render(hbs`<ClusterStorageAddForm />`);

      expect(find('.lumaFeedUrl-field')).to.not.exist;
      expect(find('.lumaFeedApiKey-field')).to.not.exist;
      await click('.lumaFeed-field .option-external input');
      expect(find('.lumaFeedUrl-field')).to.exist;
      expect(find('.lumaFeedApiKey-field')).to.exist;

      await click('.lumaFeed-field .option-local input');
      expect(find('.lumaFeedUrl-field')).to.not.exist;
      expect(find('.lumaFeedApiKey-field')).to.not.exist;
    });

    it('resets fields values after storage type change', async function () {
      await render(hbs `
        <ClusterStorageAddForm />
      `);
      await selectChoose('.type-field .dropdown-field', POSIX_TYPE.name);

      await fillIn('.name-field input', 'sometext');
      await click('.lumaFeed-field .option-external input');
      await fillIn('.lumaFeedUrl-field input', 'sometext2');

      await selectChoose('.type-field .dropdown-field', S3_TYPE.name);
      await settled();
      await click('.lumaFeed-field .option-external input');
      expect(find('.name-field input')).to.have.value('');
      expect(find('.lumaFeedUrl-field input')).to.have.value('');
    });

    it('resets fields values after change to another type and come back',
      async function () {
        await render(hbs`<ClusterStorageAddForm />`);
        await selectChoose('.type-field .dropdown-field', POSIX_TYPE.name);

        await fillIn('.mountPoint-field input', '/mnt/st1');
        await selectChoose('.type-field .dropdown-field', S3_TYPE.name);
        await settled();
        await selectChoose('.type-field .dropdown-field', POSIX_TYPE.name);
        await settled();
        expect(find('.mountPoint-field input')).to.have.value('');
      }
    );

    it('resets fields values after form visibility toggle', async function () {
      this.set('isFormOpened', true);
      await render(hbs`<ClusterStorageAddForm @isFormOpened={{isFormOpened}} />`);

      await fillIn('.name-field input', 'name');
      await click('.lumaFeed-field .option-external input');
      this.set('isFormOpened', false);
      await settled();
      this.set('isFormOpened', true);
      await settled();
      expect(find('.name-field input')).to.have.value('');
      expect(find('.lumaFeedUrl-field')).to.not.exist;
      expect(find('.lumaFeedApiKey-field')).to.not.exist;
    });

    it(
      'sets Readonly toggle to false after setting imported storage to false',
      async function () {
        await render(hbs `
          <ClusterStorageAddForm
            @mode="create"
          />
        `);
        await selectChoose('.type-field .dropdown-field', POSIX_TYPE.name);

        expect(find('.importedStorage-field .one-way-toggle')).to.not.have.class('disabled');
        expect(find('.importedStorage-field .one-way-toggle')).to.have.class('unselected');
        expect(find('.readonly-field .one-way-toggle')).to.have.class('disabled');
        expect(find('.readonly-field .one-way-toggle')).to.have.class('unselected');
        await click('.importedStorage-field .one-way-toggle');

        expect(find('.importedStorage-field .one-way-toggle')).to.have.class('checked');
        expect(find('.readonly-field .one-way-toggle')).to.not.have.class('disabled');
        expect(find('.readonly-field .one-way-toggle')).to.have.class('unselected');

        await click('.readonly-field .one-way-toggle');
        expect(find('.readonly-field .one-way-toggle')).to.have.class('checked');

        await click('.importedStorage-field .one-way-toggle');
        expect(find('.importedStorage-field .one-way-toggle')).to.have.class('unselected');
        expect(find('.readonly-field .one-way-toggle')).to.have.class('disabled');
        expect(find('.readonly-field .one-way-toggle')).to.have.class('unselected');
      }
    );

    it(
      'locks "imported storage" and "readonly" to true for HTTP storage',
      async function () {
        await render(hbs`<ClusterStorageAddForm />`);
        await selectChoose('.type-field .dropdown-field', HTTP_TYPE.name);

        expect(find('.storagePathType-field .one-way-radio-group'))
          .to.have.class('disabled');
        expect(find('.storagePathType-field .option-canonical input'))
          .to.have.property('checked', true);

        expect(find('.importedStorage-field .one-way-toggle'))
          .to.have.class('checked')
          .and.have.class('disabled');

        expect(find('.readonly-field .one-way-toggle'))
          .to.have.class('checked')
          .and.have.class('disabled');
      }
    );

    it(
      'locks "imported storage" and "readonly" to true for S3 storage with canonical path type',
      async function () {
        await render(hbs`<ClusterStorageAddForm />`);
        await selectChoose('.type-field .dropdown-field', S3_TYPE.name);

        expect(find('.storagePathType-field .one-way-radio-group'))
          .to.not.have.class('disabled');
        expect(find('.storagePathType-field .option-flat input'))
          .to.have.property('checked', true);

        expect(find('.importedStorage-field .one-way-toggle'))
          .to.have.class('unselected')
          .and.have.class('disabled');

        expect(find('.readonly-field .one-way-toggle'))
          .to.have.class('unselected')
          .and.have.class('disabled');

        await click('.storagePathType-field .option-canonical input');
        expect(find('.storagePathType-field .option-canonical input'))
          .to.have.property('checked', true);

        expect(find('.importedStorage-field .one-way-toggle'))
          .to.have.class('checked')
          .and.have.class('disabled');

        expect(find('.readonly-field .one-way-toggle'))
          .to.have.class('checked')
          .and.have.class('disabled');
      }
    );

    it(
      'locks grow speed and params and reset value to null for no imported null device storage',
      async function () {
        await render(hbs`<ClusterStorageAddForm />`);
        await selectChoose('.type-field .dropdown-field', 'Null Device');

        expect(find('.simulatedFilesystemParameters-field input'))
          .to.have.property('disabled');
        expect(find('.simulatedFilesystemGrowSpeed-field input'))
          .to.have.property('disabled');

        await click('.importedStorage-field .one-way-toggle');

        await fillIn('.name-field input', '2-3');
        await fillIn('.name-field input', '3');

        await click('.importedStorage-field .one-way-toggle');

        expect(find('.simulatedFilesystemParameters-field input'))
          .to.have.property('disabled')
          .and.have.value(undefined);
        expect(find('.simulatedFilesystemGrowSpeed-field input'))
          .to.have.property('disabled')
          .and.have.value(undefined);
      }
    );

    it(
      'locks and reset value: imported item mode if storage are s3 with path type flat',
      async function () {
        await render(hbs`<ClusterStorageAddForm />`);
        await selectChoose('.type-field .dropdown-field', S3_TYPE.name);

        expect(find('.fileMode-field input'))
          .to.have.property('disabled');
        expect(find('.dirMode-field input'))
          .to.have.property('disabled');

        await click('.storagePathType-field .option-canonical input');

        await fillIn('.fileMode-field input', '0664');
        await fillIn('.dirMode-field input', '0775');

        await click('.storagePathType-field .option-flat input');

        expect(find('.fileMode-field input'))
          .to.have.property('disabled')
          .and.have.value(undefined);
        expect(find('.dirMode-field input'))
          .to.have.property('disabled')
          .and.have.value(undefined);
      }
    );

    it(
      'locks “block size” for canonical s3 storage and change value to 0',
      async function () {
        await render(hbs`<ClusterStorageAddForm />`);
        await selectChoose('.type-field .dropdown-field', S3_TYPE.name);

        await fillIn('.blockSize-field input', 1);
        await click('.storagePathType-field .option-canonical input');

        expect(find('.blockSize-field input'))
          .to.have.property('disabled')
          .and.have.value(undefined);
      }
    );

    it(
      'locks "range write support" and have value none for webdav storage with readonly ',
      async function () {
        await render(hbs`<ClusterStorageAddForm />`);
        await selectChoose('.type-field .dropdown-field', 'WebDAV');

        await click('.importedStorage-field .one-way-toggle');
        await click('.readonly-field .one-way-toggle');

        expect(find('.rangeWriteSupport-field .option-none input'))
          .to.have.property('checked', true);
        expect(find('.rangeWriteSupport-field .option-none input'))
          .to.have.property('disabled');
        expect(find('.rangeWriteSupport-field .option-sabredav input'))
          .to.have.property('disabled');
        expect(find('.rangeWriteSupport-field .option-moddav input'))
          .to.have.property('disabled');

        await click('.readonly-field .one-way-toggle');

        expect(find('.rangeWriteSupport-field .option-none input'))
          .to.have.property('checked', false);
        expect(find('.rangeWriteSupport-field .option-sabredav input'))
          .to.have.property('checked', false);
        expect(find('.rangeWriteSupport-field .option-moddav input'))
          .to.have.property('checked', false);
      }
    );

    it(
      'unlocks "imported storage" when changing type from HTTP',
      async function () {
        await render(hbs `<ClusterStorageAddForm />`);

        await selectChoose('.type-field .dropdown-field', HTTP_TYPE.name);
        await selectChoose('.type-field .dropdown-field', POSIX_TYPE.name);

        expect(find('.importedStorage-field .one-way-toggle'))
          .to.have.class('unselected')
          .and.not.have.class('disabled');
      }
    );

    testAllowCertainPathTypeCreate({
      allow: false,
      pathType: 'canonical',
      type: CEPH_RADOS_TYPE.name,
    });

    testAllowCertainPathTypeCreate({
      allow: false,
      pathType: 'flat',
      type: POSIX_TYPE.name,
    });
  });

  context('in edit mode', function () {
    checkForStorageDetailsInEditMode('POSIX', POSIX_STORAGE, 12);
    checkForStorageDetailsInEditMode('Ceph RADOS', CEPH_RADOS_STORAGE, 13);
    checkForStorageDetailsInEditMode('NFS', NFS_STORAGE, 13);
    checkForStorageDetailsInEditMode('S3', S3_STORAGE, 18);
    checkForStorageDetailsInEditMode('Swift', SWIFT_STORAGE, 15);
    checkForStorageDetailsInEditMode('GlusterFS', GLUSTERFS_STORAGE, 13);
    checkForStorageDetailsInEditMode('WebDAV', WEBDAV_STORAGE, 17);
    checkForStorageDetailsInEditMode('HTTP', HTTP_STORAGE, 14);
    checkForStorageDetailsInEditMode('XRootD', XROOTD_STORAGE, 12);
    checkForStorageDetailsInEditMode('Null Device', NULL_DEVICE_STORAGE, 13);

    it('luma enabled toggle does not change luma fields values', async function () {
      this.set('storage', POSIX_STORAGE);
      await render(hbs `
        <ClusterStorageAddForm @storage={{storage}} @mode="edit" />
      `);

      await click('.lumaFeed-field .option-external input');
      await click('.lumaFeed-field .option-external input');

      expect(find('.storagePathType-field')).to.contain.text(POSIX_STORAGE.storagePathType);
      expect(find('.lumaFeedUrl-field input'))
        .to.have.value(String(POSIX_STORAGE.lumaFeedUrl));
      expect(find('.lumaFeedApiKey-field input'))
        .to.have.value(String(POSIX_STORAGE.lumaFeedApiKey));
    });

    it('submits only changed data', async function () {
      let submitOccurred = false;
      const storageName = 'newName';
      this.set('submit', (formData) => {
        submitOccurred = true;
        expect(_.keys(formData)).to.have.length(1);
        expect(formData.name).to.be.equal(storageName);
        return resolve();
      });

      this.set('storage', POSIX_STORAGE);
      await render(hbs `
        <ClusterStorageAddForm
          @storage={{storage}}
          @mode="edit"
          @isFormOpened={{true}}
          @onSubmit={{submit}}
        />
      `);

      await fillIn('.name-field input', storageName);
      await fillIn('.mountPoint-field input', 'someMountPoint');
      await fillIn('.mountPoint-field input', POSIX_STORAGE.mountPoint);
      await find('button[type="submit"]').click();
      expect(submitOccurred).to.be.true;
    });

    it('submits null value for cleared out optional fields', async function () {
      let submitOccurred = false;
      this.set('submit', (formData) => {
        submitOccurred = true;
        expect(_.keys(formData)).to.have.length(1);
        expect(formData.lumaFeedApiKey).to.be.null;
        return resolve();
      });

      this.set('storage', POSIX_STORAGE);
      await render(hbs `
        <ClusterStorageAddForm
          @storage={{storage}}
          @mode="edit"
          @onSubmit={{submit}}
        />
      `);

      const helper = new ClusterStorageAddHelper(this.element);
      await fillIn('.lumaFeedApiKey-field input', '');
      await helper.submit();

      expect(submitOccurred).to.be.true;
    });

    it('does not remember editor values while edit -> show -> edit cycle',
      async function () {
        this.setProperties({
          storage: POSIX_STORAGE,
          mode: 'edit',
        });
        await render(hbs `
          <ClusterStorageAddForm
            @storage={{storage}}
            @mode={{mode}}
            @onSubmit={{submit}}
          />
        `);

        await fillIn('.name-field input', 'someVal');
        this.set('mode', 'show');
        await settled();
        expect(find('.name-field div')).to.contain.text(POSIX_STORAGE.name);
        this.set('mode', 'edit');
        await settled();
        expect(find('.name-field input')).to.have.value(POSIX_STORAGE.name);
      }
    );

    it(
      'does not disable "Imported storage" when storageProvidesSupport is false',
      async function () {
        this.set('storage', POSIX_STORAGE);
        await render(hbs `
          <ClusterStorageAddForm
            @storageProvidesSupport={{false}}
            @storage={{storage}}
            @mode="edit"
          />
        `);

        expect(find('.importedStorage-field .one-way-toggle')).to.not.have.class('disabled');
      }
    );

    it('disables "Imported storage" when storageProvidesSupport is true',
      async function () {
        this.set('storage', POSIX_STORAGE);
        await render(hbs `
          <ClusterStorageAddForm
            @storageProvidesSupport={{true}}
            @storage={{storage}}
            @mode="edit"
          />
        `);

        expect(find('.importedStorage-field .one-way-toggle')).to.have.class('disabled');
      }
    );

    it(
      'restores "Imported storage" field original value when this field has been disabled',
      async function () {
        this.set('storage', POSIX_STORAGE);
        this.set('storageProvidesSupport', false);
        const submitStub = sinon.stub().resolves();
        this.set('submit', submitStub);
        await render(hbs `
          <ClusterStorageAddForm
            @storageProvidesSupport={{storageProvidesSupport}}
            @storage={{storage}}
            @mode="edit"
            @onSubmit={{submit}}
          />
        `);

        expect(find('.importedStorage-field .one-way-toggle')).to.have.class('checked');
        await click('.importedStorage-field .one-way-toggle');
        expect(find('.importedStorage-field .one-way-toggle')).to.have.class('unselected');
        this.set('storageProvidesSupport', true);
        await settled();
        expect(find('.importedStorage-field .one-way-toggle')).to.have.class('checked');
        const helper = new ClusterStorageAddHelper(this.element);
        await helper.submit();
        expect(submitStub).to.be.calledWith(
          sinon.match(formData => formData.importedStorage === undefined)
        );
      }
    );

    it(
      'locks "imported storage" and "readonly" to true for HTTP storage',
      async function () {
        this.set('storage', HTTP_STORAGE);
        await render(hbs `<ClusterStorageAddForm @storage={{storage}} @mode="edit" />`);

        expect(find('.importedStorage-field .one-way-toggle'))
          .to.have.class('checked')
          .and.have.class('disabled');

        expect(find('.readonly-field .one-way-toggle'))
          .to.have.class('checked')
          .and.have.class('disabled');

      });

    it(
      'locks "imported storage" and "readonly" to true for HTTP storage after change from show mode',
      async function () {
        this.setProperties({
          storage: HTTP_STORAGE,
          mode: 'show',
        });
        await render(hbs `<ClusterStorageAddForm @storage={{storage}} @mode={{mode}} />`);

        this.set('mode', 'edit');

        await settled();

        expect(find('.importedStorage-field .one-way-toggle'))
          .to.have.class('checked')
          .and.have.class('disabled');

        expect(find('.readonly-field .one-way-toggle'))
          .to.have.class('checked')
          .and.have.class('disabled');
      });

    it(
      'locks "imported storage" to true for non-HTTP storage with enabled import and provides support after change from show mode',
      async function () {
        this.setProperties({
          storage: POSIX_STORAGE,
          mode: 'show',
        });
        await render(hbs `
          <ClusterStorageAddForm
            @storage={{storage}}
            @mode={{mode}}
            @storageProvidesSupport={{true}}
          />
        `);

        expect(find('.importedStorage-field .one-way-toggle'))
          .to.have.class('checked')
          .and.have.class('disabled');

        this.set('mode', 'edit');
        await settled();
        expect(find('.importedStorage-field .one-way-toggle'))
          .to.have.class('checked')
          .and.have.class('disabled');
      });

    it(
      'locks "imported storage" to true for posix after added support',
      async function () {
        this.setProperties({
          storage: POSIX_STORAGE,
          mode: 'edit',
          storageProvidesSupport: false,
        });
        await render(hbs `
          <ClusterStorageAddForm
            @storage={{storage}}
            @mode={{mode}}
            @storageProvidesSupport={{storageProvidesSupport}}
          />
        `);

        await click('.importedStorage-field .one-way-toggle');
        this.set('storageProvidesSupport', true);
        await settled();
        expect(find('.importedStorage-field .one-way-toggle'))
          .to.have.class('checked')
          .and.have.class('disabled');
      });

    it('does not allow to edit path type of storage with type "POSIX"', async function () {
      this.setProperties({
        storage: POSIX_STORAGE,
        mode: 'edit',
      });
      await render(hbs `
        <ClusterStorageAddForm
          @storage={{storage}}
          @mode={{mode}}
          @storageProvidesSupport={{true}}
        />
      `);

      expect(find('.storagePathType-field')).to.contain.text(POSIX_STORAGE.storagePathType);
      expect(find('.storagePathType-field').querySelectorAll('.one-way-radio-group'))
        .to.have.length(0);
    });
  });
});
