import { expect } from 'chai';
import { it, describe, context } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, fillIn, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { tracked } from '@glimmer/tracking';
import Cluster from 'onepanel-gui/models/cluster';
import { lookupService } from '../../helpers/stub-service';
import { computed } from '@ember/object';
import ClusterHostInfo from 'onepanel-gui/models/cluster-host-info';
import sinon from 'sinon';
import { htmlSafe } from '@ember/string';

describe('Integration | Component | new-cluster-installation', function () {
  const { beforeEach } = setupRenderingTest();

  it('renders hosts table with hostnames in hosts table', async function () {
    const helper = new Helper(this);
    helper.mockHosts();

    await helper.render();

    expect(helper.getElement()).to.exist;
    expect(
      helper
      .getClusterHostTable()
      .querySelector('tbody tr .row-header .one-label')
      .textContent
      .trim()
    ).to.equal('test1.example.com');
  });

  it('does not render OneS3 port in the table if there is no OneS3 enabled', async function () {
    // given
    const helper = new Helper(this);
    helper.mockHosts();

    // when
    await helper.render();

    // then
    expect(helper.getElement()).to.exist;
    expect(
      helper
      .getClusterHostTable()
      .querySelector('.one-s3-port')
    ).to.not.exist;
  });

  //#region auto default and fallback port

  it('renders OneS3 port input with default value if OneS3 is enabled on host without worker', async function () {
    // given
    const helper = new Helper(this);
    helper.mockHosts();

    // when
    await helper.render();
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
    helper.mockHosts();

    // when
    await helper.render();
    await click('[data-option=clusterWorker] .one-way-toggle');
    await click('[data-option=oneS3] .one-way-toggle');

    // then
    expect(
      helper
      .getClusterHostTable()
      .querySelector('.one-s3-port .one-s3-port-input')
      .value
    ).to.equal('4443');
  });

  it('changes OneS3 port input value to fallback value if OneS3 is enabled and worker gets enabled',
    async function () {
      // given
      const helper = new Helper(this);
      helper.mockHosts();

      // when
      await helper.render();
      await click('[data-option=oneS3] .one-way-toggle');
      await click('[data-option=clusterWorker] .one-way-toggle');

      // then
      expect(
        helper
        .getClusterHostTable()
        .querySelector('.one-s3-port .one-s3-port-input')
        .value
      ).to.equal('4443');
    }
  );

  it('changes OneS3 port input value to default value if worker and OneS3 are enabled and worker gets disabled',
    async function () {
      // given
      const helper = new Helper(this);
      helper.mockHosts();

      // when
      await helper.render();
      await click('[data-option=clusterWorker] .one-way-toggle');
      await click('[data-option=oneS3] .one-way-toggle');
      await click('[data-option=clusterWorker] .one-way-toggle');

      // then
      expect(
        helper
        .getClusterHostTable()
        .querySelector('.one-s3-port .one-s3-port-input')
        .value
      ).to.equal('443');
    }
  );

  it('keeps OneS3 port input fallback value if there is OneS3-Worker conflict on host another than changed',
    async function () {
      // given
      const helper = new Helper(this);
      helper.mockHosts(['a.example.com', 'b.example.com']);

      // when
      await helper.render();
      const firstRowToggles = helper
        .getClusterHostTable()
        .querySelector('tbody tr')
        .querySelectorAll('.one-way-toggle');
      // cause conflict in first row
      for (const toggle of firstRowToggles) {
        await click(toggle);
      }
      // cause and clear conflict in second row
      const secondRow = helper.getClusterHostTable().querySelectorAll('tbody tr')[1];
      await click(secondRow.querySelector('[data-option=clusterWorker] .one-way-toggle'));
      await click(secondRow.querySelector('[data-option=oneS3] .one-way-toggle'));
      await click(secondRow.querySelector('[data-option=clusterWorker] .one-way-toggle'));

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

  // FIXME: po prawidłowym wykonaniu testu jest błąd w konsoli JS: Can not call .lookup
  // after owner destroyed spowodowany tym, że w tle działa watcher
  it('can start deployment with custom OneS3 port', async function () {
    // given
    const helper = new Helper(this);
    helper.mockHosts();
    const requestSpy = helper.getOnepanelRequestSpy();

    // when
    await helper.render();
    const toggles = helper.getClusterHostTable().querySelectorAll('.one-way-toggle');
    for (const toggle of toggles) {
      await click(toggle);
    }
    await fillIn(helper.getOneS3PortInput(), '1234');
    await click(helper.querySelector('.btn-deploy-cluster'));

    // then
    expect(requestSpy).to.have.been.calledWith(
      'OneproviderClusterApi',
      'configureProvider',
      sinon.match.hasNested('cluster.oneS3.port', 1234)
    );
  });

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
      expect(this.helper.getDeployClusterButton()).to.have.attribute('disabled');
    }

    beforeEach(function () {
      this.helper = new Helper(this);
      this.expectInvalidInputAndDisabledSubmit =
        expectInvalidInputAndDisabledSubmit.bind(this);
    });

    testCases.forEach(({ description, input }) => {
      it(description, async function () {
        // given
        this.helper.mockHosts();

        // when
        await this.helper.render();
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
    this.helper.mockHosts();

    // when
    await this.helper.render();
    await this.helper.enableAllFirstRowToggles();
    await this.helper.fillInOneS3Port('  1 ');

    // then
    expect(this.helper.querySelector('.one-s3-port')).to.not.have.class('has-error');
    expect(this.helper.getDeployClusterButton()).to.not.have.attribute('disabled');
  });
});

class NewClusterInstallationRenderContext {
  /** @type {Function} */
  @tracked nextStep;

  @tracked stepData;
  @tracked deploymentTaskId;

  @tracked containerWidth = 1000;

  get containerStyle() {
    return htmlSafe(`width: ${this.containerWidth}px;`);
  }
}

class Helper {
  /**
   * @param {Mocha.Context} mochaContext
   */
  constructor(mochaContext) {
    this.mochaContext = mochaContext;
    this.renderContext = new NewClusterInstallationRenderContext();
    this.mochaContext.renderContext = this.renderContext;
  }

  getService(serviceName) {
    return lookupService(this.mochaContext, serviceName);
  }

  getElement() {
    return this.mochaContext.element.querySelector('.new-cluster-installation');
  }

  /** @returns {HTMLElement} */
  querySelector(selector) {
    return this.getElement().querySelector(selector);
  }

  /** @returns {HTMLDivElement} */
  getClusterHostTable() {
    return this.querySelector('.cluster-host-table');
  }

  getOnepanelRequestSpy() {
    return sinon.spy(this.getService('onepanelServer'), 'request');
  }

  getOneS3PortInput() {
    return this.querySelector('.one-s3-port input');
  }

  /** @returns {HTMLButtonElement} */
  getDeployClusterButton() {
    return this.querySelector('.btn-deploy-cluster');
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

  mockHosts(hostnames = ['test1.example.com']) {
    sinon.stub(this.getService('deploymentManager'), 'getHosts')
      .resolves(hostnames.map(hostname => ({ hostname })));
  }

  async render() {
    await render(hbs`
      <dev class="component-test-container" style={{this.renderContext.containerStyle}}>
        <NewClusterInstallation
          @nextStep={{this.renderContext.nextStep}}
          @stepData={{this.renderContext.stepData}}
          @deploymentTaskId={{this.renderContext.deploymentTaskId}}
        />
      </dev>
    `);
  }
}
