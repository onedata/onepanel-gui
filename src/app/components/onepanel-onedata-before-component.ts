/**
 * Element inserted in the beginning of the onedata route template for Onepanel GUI.
 * Adds support for displaying emergency bar.
 *
 * @author Jakub Liput
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Controller from '@ember/controller';
import CommonOnedataBeforeComponent, { OnedataBeforeComponentArgs } from 'onedata-gui-common/components/onedata-before-component';
import { computed } from '@ember/object';

interface OnepanelOnedataController extends Controller {
  /** If true, renders the "Emergency Onepanel" info bar at the bottom.  */
  emergencyWarningBarVisible: boolean
}

interface OnepanelOnedataBeforeComponentArgs extends OnedataBeforeComponentArgs {
  controller: OnepanelOnedataController
}

export default class OnepanelOnedataBeforeComponent extends CommonOnedataBeforeComponent<
  OnepanelOnedataBeforeComponentArgs
> {
  @computed('args.controller.emergencyWarningBarVisible')
  get isEmergencyWarningBarVisible() {
    return this.args.controller.emergencyWarningBarVisible;
  }
}
