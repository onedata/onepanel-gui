import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { tracked } from '@glimmer/tracking';
import { lookupService } from '../../../helpers/stub-service';
import { BoundOneS3ClusterValidator } from 'onepanel-gui/components/cluster-host-table';
import EmberObject from '@ember/object';

describe('Integration | Component | cluster-host-table/one-s3-port', function () {
  setupRenderingTest();

  for (const tableMode of ['show', 'edit', 'create']) {
    it(`does not render if there no OneS3 enabled in ${tableMode} table mode`, async function () {
      this.helper = new Helper(this);
      const hostInfo = {
        hostname: 'example.com',
        database: true,
        clusterWorker: true,
        clusterManager: true,
        oneS3: false,
      };
      const hosts = [
        this.helper.createClusterHostInfo(hostInfo),
      ];
      const portValue = '123';
      const validator = new BoundOneS3ClusterValidator({ hosts, portValue });
      Object.assign(this.helper.renderContext, {
        portValue,
        currentHosts: hosts,
        initialHosts: [
          hostInfo,
        ],
        tableMode: 'show',
        validator,
      });

      await this.helper.render();

      expect(this.helper.getElement()).to.not.exist;
    });
  }

  it('renders provided static port value if there is already deployed OneS3', async function () {
    this.helper = new Helper(this);
    const hostInfo = {
      hostname: 'example.com',
      database: true,
      clusterWorker: true,
      clusterManager: true,
      oneS3: true,
    };
    const hosts = [
      this.helper.createClusterHostInfo(hostInfo),
    ];
    const portValue = '123';
    const validator = new BoundOneS3ClusterValidator({ hosts, portValue });
    Object.assign(this.helper.renderContext, {
      portValue,
      currentHosts: hosts,
      initialHosts: [
        hostInfo,
      ],
      tableMode: 'show',
      validator,
    });

    await this.helper.render();

    expect(this.helper.getElement()?.textContent).to.contain('123');
  });

  it('renders disabled input in edit mode if oneS3 is already enabled', async function () {
    this.helper = new Helper(this);
    const hostInfo = {
      hostname: 'example.com',
      database: true,
      clusterWorker: true,
      clusterManager: true,
      oneS3: true,
    };
    const hosts = [
      this.helper.createClusterHostInfo(hostInfo),
    ];
    const portValue = '123';
    const validator = new BoundOneS3ClusterValidator({ hosts, portValue });
    Object.assign(this.helper.renderContext, {
      portValue,
      currentHosts: hosts,
      initialHosts: [
        hostInfo,
      ],
      tableMode: 'edit',
      validator,
    });

    await this.helper.render();

    const input = this.helper.getInput();
    expect(input).to.exist;
    expect(input.value).to.equal('123');
    expect(input.hasAttribute('disabled')).to.be.true;
  });

  it('renders enabled input in edit mode if oneS3 has been enabled', async function () {
    this.helper = new Helper(this);
    const initialHosts = [{
      hostname: 'example1.com',
      database: true,
      clusterWorker: true,
      clusterManager: true,
      oneS3: false,
    }];
    const currentHosts = [this.helper.createClusterHostInfo({
      hostname: 'example1.com',
      database: true,
      clusterWorker: true,
      clusterManager: true,
      oneS3: true,
    })];
    const portValue = '123';
    const validator = new BoundOneS3ClusterValidator({ currentHosts, portValue });
    Object.assign(this.helper.renderContext, {
      portValue,
      currentHosts,
      initialHosts,
      tableMode: 'edit',
      validator,
    });

    await this.helper.render();

    const input = this.helper.getInput();
    expect(input).to.exist;
    expect(input.value).to.equal('123');
    expect(input.hasAttribute('disabled')).to.be.false;
  });
});

class OneS3PortRenderContext {
  /** @type {Array} */
  @tracked currentHosts;

  /** @type {Array} */
  @tracked initialHosts;

  /** @type {string} */
  @tracked tableMode;

  /** @type {string} */
  @tracked portValue;

  /** @type {any} */
  @tracked validator;

  /** @type {Function} */
  @tracked onChange;

  /** @type {boolean} */
  @tracked isPortValueModified;
}

class Helper {
  /** @type {OneS3PortRenderContext} */
  renderContext;

  /**
   * @param {Mocha.Context} mochaContext
   */
  constructor(mochaContext) {
    this.mochaContext = mochaContext;
    this.renderContext = new OneS3PortRenderContext();
  }

  createClusterHostInfo(data) {
    return EmberObject.create(data);
  }

  /** @returns {HTMLElement|null} */
  getElement() {
    return find('.one-s3-port');
  }

  /** @returns {HTMLInputElement|null} */
  getInput() {
    return this.getElement().querySelector('.one-s3-port-input');
  }

  async render() {
    this.mochaContext.set('renderContext', this.renderContext);
    await render(hbs`
      <ClusterHostTable::OneS3Port
        @currentHosts={{this.renderContext.currentHosts}}
        @initialHosts={{this.renderContext.initialHosts}}
        @tableMode={{this.renderContext.tableMode}}
        @portValue={{this.renderContext.portValue}}
        @validator={{this.renderContext.validator}}
        @isPortValueModified={{this.renderContext.isPortValueModified}}
        @onChange={{this.renderContext.onChange}}
      />
    `);
  }
}
