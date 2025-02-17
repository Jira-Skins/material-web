/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {Harness} from '../testing/harness';

import {Fab} from './lib/fab';

/**
 * Test harness for floating action buttons.
 */
export class FabHarness extends Harness<Fab> {
  protected override async getInteractiveElement() {
    await this.element.updateComplete;
    return this.element.renderRoot.querySelector('.md3-fab') as HTMLElement;
  }
}
