import { expect } from 'chai';
import { describe, it, context } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, fillIn, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { tracked } from '@glimmer/tracking';
import Cluster from 'onepanel-gui/models/cluster';
import { lookupService } from '../../helpers/stub-service';
import { computed } from '@ember/object';
import ClusterHostInfo from 'onepanel-gui/models/cluster-host-info';
import sinon from 'sinon';
import OneTooltipHelper from '../../helpers/one-tooltip';

describe('Integration | Component | content-clusters-nodes', function () {
  const { beforeEach } = setupRenderingTest();

  it('renders with cluster name and hostnames in hosts table', async function () {
    const helper = new Helper(this);
    helper.mockExampleCluster();
    helper.mockSingleClusterDeploymentInfo();

    await helper.render();

    expect(helper.getElement()).to.exist;
    expect(helper.getHeader().textContent.trim()).to.equal('Nodes of "Example cluster"');
    expect(
      helper
      .getClusterHostTable()
      .querySelector('tbody tr .row-header .one-label')
      .textContent
      .trim()
    ).to.equal('test1.example.com');
    expect(
      helper
      .getClusterHostTable()
      .querySelector('tbody tr .row-header .one-label')
      .textContent
      .trim()
    ).to.equal('test1.example.com');
  });

  it('renders with custom OneS3 port in the table', async function () {
    const helper = new Helper(this);
    helper.mockExampleCluster();
    helper.mockSingleClusterDeploymentInfo({
      oneS3: true,
    }, {
      oneS3Port: 1234,
    });

    await helper.render();

    expect(
      helper
      .getClusterHostTable()
      .querySelector('.one-s3-port')
      .textContent
      .trim()
    ).to.equal('1234');
  });

  it('renders without OneS3 port in the table if there is no OneS3', async function () {
    const helper = new Helper(this);
    helper.mockExampleCluster();
    helper.mockSingleClusterDeploymentInfo({
      oneS3: false,
    });

    await helper.render();

    expect(helper.getElement()).to.exist;
    expect(
      helper
      .getClusterHostTable()
      .querySelector('.one-s3-port')
    ).to.not.exist;
  });

  it('can submit OneS3 with custom port when enabling first OneS3', async function () {
    // given
    const helper = new Helper(this);
    helper.mockExampleCluster();
    helper.mockSingleClusterDeploymentInfo({
      oneS3: false,
    }, {
      oneS3Port: 1234,
    });
    const requestSpy = helper.getOnepanelRequestSpy();

    // when
    await helper.render();
    await click(helper.getEditServicesButton());
    const oneS3Toggle =
      helper.getElement().querySelector('[data-option=oneS3] .one-way-toggle');
    await click(oneS3Toggle);
    const oneS3PortInput =
      helper.getClusterHostTable().querySelector('.one-s3-port input');
    await fillIn(oneS3PortInput, '5678');
    const submitButton = helper.getSubmitHostsButton();
    await click(submitButton);
    const proceedButton = helper.getEnableS3Modal().querySelector('button.proceed');
    await click(proceedButton);

    // then
    expect(requestSpy).to.have.been.calledWith(
      'OneproviderClusterApi',
      'addOnes3', {
        hosts: ['test1.example.com'],
        port: 5678,
      }
    );
  });

  // FIXME: zmienić na context
  //#region auto default and fallback port

  it('renders OneS3 port input with default value if OneS3 is enabled on host without worker', async function () {
    // given
    const helper = new Helper(this);
    helper.mockExampleCluster();
    helper.mockSingleClusterDeploymentInfo({
      database: false,
      clusterWorker: false,
      clusterManager: false,
      oneS3: false,
    });

    // when
    await helper.render();
    await click(helper.getEditServicesButton());
    await click('[data-option=oneS3] .one-way-toggle');

    // then
    expect(
      helper
      .getClusterHostTable()
      .querySelector('.one-s3-port .one-s3-port-input')
      .value
    ).to.equal('443');
  });

  it('renders OneS3 port input with fallback value if OneS3 is enabled on host with worker', async function () {
    // given
    const helper = new Helper(this);
    helper.mockExampleCluster();
    helper.mockSingleClusterDeploymentInfo({
      database: true,
      clusterWorker: true,
      clusterManager: true,
      oneS3: false,
    });

    // when
    await helper.render();
    await click(helper.getEditServicesButton());
    await click('[data-option=oneS3] .one-way-toggle');

    // then
    expect(
      helper
      .getClusterHostTable()
      .querySelector('.one-s3-port .one-s3-port-input')
      .value
    ).to.equal('4443');
  });

  // FIXME: Can not call `.lookup` after the owner has been destroyed
  it('keeps OneS3 port input fallback value if there is OneS3-Worker conflict on host another than changed',
    async function () {
      // given
      const helper = new Helper(this);
      helper.mockExampleCluster();
      helper.mockDoubleClusterDeploymentInfo([{
        database: true,
        clusterWorker: true,
        clusterManager: true,
        oneS3: false,
      }, {
        database: false,
        clusterWorker: false,
        clusterManager: false,
        oneS3: false,
      }]);

      // when
      await helper.render();
      await click(helper.getEditServicesButton());
      const rows = helper.getClusterHostTable().querySelectorAll('tbody tr');
      await click(rows[0].querySelector('[data-option=oneS3] .one-way-toggle'));
      await click(rows[1].querySelector('[data-option=oneS3] .one-way-toggle'));
      // disable OneS3 on non-conflicting host
      await click(rows[1].querySelector('[data-option=oneS3] .one-way-toggle'));

      // then
      expect(
        helper
        .getClusterHostTable()
        .querySelector('.one-s3-port .one-s3-port-input')
        .value
      ).to.equal('4443');
    }
  );

  //#endregion

  context('has invalid input state and blocks save button when', async function () {
    const testCases = [{
        description: 'port conflicts between Cluster Worker and OneS3',
        input: '443',
      },
      {
        description: 'port input is empty',
        input: '',
      },
      {
        description: 'port input is not a number',
        input: 'hello',
      },
      {
        description: 'port input is not an integer',
        input: '1.2',
      },
      {
        description: 'port value is integer but in form of float',
        input: '1.0',
      },
      {
        description: 'port input is number < 0',
        input: '-4443',
      },
      {
        description: 'port input is number > 65535',
        input: '65536',
      },
    ];

    function expectInvalidInputAndDisabledSubmit() {
      expect(this.helper.querySelector('.one-s3-port')).to.have.class('has-error');
      expect(this.helper.getSubmitHostsButton()).to.have.attribute('disabled');
    }

    beforeEach(function () {
      this.helper = new Helper(this);
      this.expectInvalidInputAndDisabledSubmit =
        expectInvalidInputAndDisabledSubmit.bind(this);
    });

    testCases.forEach(({ description, input }) => {
      it(description, async function () {
        // given
        this.helper.mockExampleCluster();
        this.helper.mockSingleClusterDeploymentInfo({
          oneS3: false,
        });

        // when
        await this.helper.render();
        await click(this.helper.getEditServicesButton());
        await this.helper.enableAllFirstRowToggles();
        await this.helper.fillInOneS3Port(input);

        // then
        this.expectInvalidInputAndDisabledSubmit();
      });
    });
  });

  it('has valid OneS3 port input when port is valid number but with spaces', async function () {
    // given
    this.helper = new Helper(this);
    this.helper.mockExampleCluster();
    this.helper.mockSingleClusterDeploymentInfo({
      oneS3: false,
    });

    // when
    await this.helper.render();
    await click(this.helper.getEditServicesButton());
    await this.helper.enableAllFirstRowToggles();
    await this.helper.fillInOneS3Port('  1 ');

    // then
    expect(this.helper.querySelector('.one-s3-port')).to.not.have.class('has-error');
    expect(this.helper.getSubmitHostsButton()).to.not.have.attribute('disabled');
  });

  it('has disabled OneS3 toggle in the host row if there is already other OneS3 deployed on port 443',
    async function () {
      // given
      const helper = new Helper(this);
      helper.mockExampleCluster();
      helper.mockDoubleClusterDeploymentInfo([{
        database: true,
        clusterWorker: true,
        clusterManager: true,
        oneS3: false,
      }, {
        database: false,
        clusterWorker: false,
        clusterManager: false,
        oneS3: true,
      }], {
        oneS3Port: 443,
      });

      // when
      await helper.render();
      await click(helper.getEditServicesButton());

      // then
      const firstRow = this.helper.getClusterHostTable().querySelector('tbody tr');
      const toggle = firstRow.querySelector('[data-option=oneS3] .one-way-toggle');
      expect(toggle).to.have.class('disabled');
      const tooltip = new OneTooltipHelper(toggle.querySelector('.tooltip-container'));
      const tooltipText = await tooltip.getText();
      expect(tooltipText).to.match(
        /You cannot enable OneS3 on hosts that have already deployed Cluster Worker/
      );
    }
  );

  context('has proper tooltip for OneS3 port', async function () {
    it('if OneS3 is already enabled', async function () {
      // given
      const helper = new Helper(this);
      helper.mockExampleCluster();
      helper.mockSingleClusterDeploymentInfo({}, { oneS3Port: 4443 });

      // when-then
      await helper.render();
      await helper.expectOneS3Tooltip(
        'Port number for the OneS3 service on the host.'
      );
    });

    it('if OneS3 is already enabled and cluster is being edited',
      async function () {
        // given
        const helper = new Helper(this);
        helper.mockExampleCluster();
        helper.mockDoubleClusterDeploymentInfo([{
          database: true,
          clusterWorker: true,
          clusterManager: true,
          oneS3: false,
        }, {
          database: true,
          clusterWorker: false,
          clusterManager: false,
          oneS3: true,
        }], {
          oneS3Port: 443,
        });

        // when-then
        await helper.render();
        await click(helper.getEditServicesButton());
        await helper.expectOneS3Tooltip(
          'Port number for the OneS3 service on the host.',
          'Note, that the port can be set only once, when the OneS3 is added to the cluster for the first time. Additional OneS3 services added later will use the same port.',
        );
      }
    );

    it('if OneS3 port is being automatically set to non-colliding value',
      async function () {
        // given
        const helper = new Helper(this);
        helper.mockExampleCluster();
        helper.mockDoubleClusterDeploymentInfo([{
          database: true,
          clusterWorker: true,
          clusterManager: true,
          oneS3: false,
        }, {
          database: true,
          clusterWorker: false,
          clusterManager: false,
          oneS3: false,
        }]);

        // when-then
        await helper.render();
        await click(helper.getEditServicesButton());
        const firstRow = this.helper.getClusterHostTable().querySelector('tbody tr');
        const toggle = firstRow.querySelector('[data-option=oneS3] .one-way-toggle');
        await click(toggle);
        await helper.expectOneS3Tooltip(
          'Port number for the OneS3 service on the host.',
          'It has been automatically set to the recommended value, which does not conflict with the Cluster Worker port, but you can customize it.',
          'Note, that the port can be set only once, when the OneS3 is added to the cluster for the first time. Additional OneS3 services added later will use the same port.',
        );
      }
    );

    it('if OneS3 port is being automatically set to the default value',
      async function () {
        // given
        const helper = new Helper(this);
        helper.mockExampleCluster();
        helper.mockDoubleClusterDeploymentInfo([{
          database: true,
          clusterWorker: true,
          clusterManager: true,
          oneS3: false,
        }, {
          database: true,
          clusterWorker: false,
          clusterManager: false,
          oneS3: false,
        }]);

        // when-then
        await helper.render();
        await click(helper.getEditServicesButton());
        const secondRow =
          this.helper.getClusterHostTable().querySelectorAll('tbody tr')[1];
        const toggle = secondRow.querySelector('[data-option=oneS3] .one-way-toggle');
        await click(toggle);
        await helper.expectOneS3Tooltip(
          'Port number for the OneS3 service on the host.',
          'It has been automatically set to the recommended value, but you can customize it.',
          'Note, that the port can be set only once, when the OneS3 is added to the cluster for the first time. Additional OneS3 services added later will use the same port.',
        );
      }
    );

    it('if OneS3 port is set to custom valid value',
      async function () {
        // given
        const helper = new Helper(this);
        helper.mockExampleCluster();
        helper.mockDoubleClusterDeploymentInfo([{
          database: true,
          clusterWorker: true,
          clusterManager: true,
          oneS3: false,
        }, {
          database: true,
          clusterWorker: false,
          clusterManager: false,
          oneS3: false,
        }]);

        // when-then
        await helper.render();
        await click(helper.getEditServicesButton());
        const secondRow =
          this.helper.getClusterHostTable().querySelectorAll('tbody tr')[1];
        const toggle = secondRow.querySelector('[data-option=oneS3] .one-way-toggle');
        await click(toggle);
        await helper.fillInOneS3Port('1234');
        await helper.expectOneS3Tooltip(
          'Port number for the OneS3 service on the host.',
          'Note, that the port can be set only once, when the OneS3 is added to the cluster for the first time. Additional OneS3 services added later will use the same port.',
        );
      }
    );

    context('if OneS3 port is set to custom invalid value', async function () {
      it('because of conflicting port', async function () {
        // given
        const helper = new Helper(this);
        helper.mockExampleCluster();
        helper.mockSingleClusterDeploymentInfo({
          database: true,
          clusterWorker: true,
          clusterManager: true,
          oneS3: false,
        });

        // when-then
        await helper.render();
        await click(helper.getEditServicesButton());
        const firstRow =
          this.helper.getClusterHostTable().querySelector('tbody tr');
        const toggle = firstRow.querySelector('[data-option=oneS3] .one-way-toggle');
        await click(toggle);
        await helper.fillInOneS3Port('443');
        await helper.expectOneS3Tooltip(
          'Port number for the OneS3 service on the host.',
          'The current value is invalid: cannot use the 443 port for OneS3 when the Cluster Worker is on the same host.',
          'Note, that the port can be set only once, when the OneS3 is added to the cluster for the first time. Additional OneS3 services added later will use the same port.',
        );
      });

      it('because of invalid port number', async function () {
        // given
        const helper = new Helper(this);
        helper.mockExampleCluster();
        helper.mockSingleClusterDeploymentInfo({
          database: true,
          clusterWorker: true,
          clusterManager: true,
          oneS3: false,
        });

        // when-then
        await helper.render();
        await click(helper.getEditServicesButton());
        const firstRow =
          this.helper.getClusterHostTable().querySelector('tbody tr');
        const toggle = firstRow.querySelector('[data-option=oneS3] .one-way-toggle');
        await click(toggle);
        await helper.fillInOneS3Port('3.14');
        await helper.expectOneS3Tooltip(
          'Port number for the OneS3 service on the host.',
          'The current value is invalid: not a valid TCP port number.',
          'Note, that the port can be set only once, when the OneS3 is added to the cluster for the first time. Additional OneS3 services added later will use the same port.',
        );
      });

      it('because of blank port number', async function () {
        // given
        const helper = new Helper(this);
        helper.mockExampleCluster();
        helper.mockSingleClusterDeploymentInfo({
          database: true,
          clusterWorker: true,
          clusterManager: true,
          oneS3: false,
        });

        // when-then
        await helper.render();
        await click(helper.getEditServicesButton());
        const firstRow =
          this.helper.getClusterHostTable().querySelector('tbody tr');
        const toggle = firstRow.querySelector('[data-option=oneS3] .one-way-toggle');
        await click(toggle);
        await helper.fillInOneS3Port('');
        await helper.expectOneS3Tooltip(
          'Port number for the OneS3 service on the host.',
          'The current value is invalid: port number can\'t be blank.',
          'Note, that the port can be set only once, when the OneS3 is added to the cluster for the first time. Additional OneS3 services added later will use the same port.',
        );
      });
    });
  });
});

class ContentClustersNodesRenderContext {
  /** @type {Cluster} */
  @tracked cluster;
}

class Helper {
  /**
   * @param {Mocha.Context} mochaContext
   */
  constructor(mochaContext) {
    this.mochaContext = mochaContext;
    this.renderContext = new ContentClustersNodesRenderContext();
    this.mochaContext.renderContext = this.renderContext;
  }

  @computed()
  get deploymentManager() {
    return lookupService(this.mochaContext, 'deploymentManager');
  }

  @computed()
  get onepanelServer() {
    return lookupService(this.mochaContext, 'onepanelServer');
  }

  getElement() {
    return this.mochaContext.element.querySelector('.content-clusters-nodes');
  }

  /** @returns {HTMLElement|null} */
  querySelector(selector) {
    return this.getElement().querySelector(selector);
  }

  getHeader() {
    return this.querySelector('.header-row h1');
  }

  getEditServicesButton() {
    return this.querySelector('.edit-services-btn');
  }

  getClusterHostTable() {
    return this.querySelector('.cluster-host-table');
  }

  getSubmitHostsButton() {
    return this.querySelector('.btn-submit-cluster-nodes');
  }

  getOneS3PortInput() {
    return this.getClusterHostTable().querySelector('.one-s3-port .one-s3-port-input');
  }

  getEnableS3Modal() {
    return find('.enable-s3-modal');
  }

  getOnepanelRequestSpy() {
    return sinon.spy(this.onepanelServer, 'request');
  }

  getOneS3PortFeedbackIcon() {
    return this.getClusterHostTable().querySelector('.one-s3-feedback-icon');
  }

  async enableAllFirstRowToggles() {
    const firstRowToggles = this
      .getClusterHostTable()
      .querySelector('tbody tr')
      .querySelectorAll('.one-way-toggle');
    for (const toggle of firstRowToggles) {
      await click(toggle);
    }
  }

  async fillInOneS3Port(value) {
    await fillIn(this.getOneS3PortInput(), value);
  }

  /**
   * @param {ClusterDeploymentInfo} deploymentInfo
   */
  mockClusterDeploymentInfo(deploymentInfo) {
    sinon.stub(this.deploymentManager, 'getClusterHostsInfo').resolves(deploymentInfo);
  }

  mockSingleClusterDeploymentInfo(hostInfoData, deploymentData) {
    this.mockClusterDeploymentInfo({
      mainManagerHostname: 'test1.example.com',
      clusterHostsInfo: [
        ClusterHostInfo.create({
          hostname: 'test1.example.com',
          database: true,
          clusterWorker: true,
          clusterManager: true,
          oneS3: true,
          ...hostInfoData,
        }),
      ],
      oneS3Port: 4443,
      ...deploymentData,
    });
  }

  mockDoubleClusterDeploymentInfo(hostsInfoData, deploymentData) {
    this.mockClusterDeploymentInfo({
      mainManagerHostname: 'test1.example.com',
      clusterHostsInfo: [
        ClusterHostInfo.create({
          hostname: 'test1.example.com',
          database: true,
          clusterWorker: true,
          clusterManager: true,
          oneS3: false,
          ...hostsInfoData[0],
        }),
        ClusterHostInfo.create({
          hostname: 'test2.example.com',
          database: false,
          clusterWorker: false,
          clusterManager: false,
          oneS3: false,
          ...hostsInfoData[1],
        }),
      ],
      oneS3Port: 4443,
      ...deploymentData,
    });
  }

  mockExampleCluster() {
    this.renderContext.cluster = Cluster.create({
      name: 'Example cluster',
      domain: 'test.example.com',
      isLocal: true,
      id: 'cluster1',
    });
  }

  /** @returns {Promise<string>} */
  async getOneS3TooltipText() {
    const tooltip = new OneTooltipHelper(this.getOneS3PortFeedbackIcon());
    return await tooltip.getText();
  }

  async expectOneS3Tooltip(...expectedText) {
    const originalTooltipText = await this.getOneS3TooltipText();
    let tooltipText = originalTooltipText;
    for (const text of expectedText) {
      expect(tooltipText.startsWith(text), `"${originalTooltipText}"`).to.be.ok;
      tooltipText = tooltipText.replace(text, '').trim();
    }
  }

  async render() {
    await render(hbs`
      <ContentClustersNodes @cluster={{this.renderContext.cluster}} />
      <GlobalModalMounter />
    `);
  }
}
