/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {ReactiveController, ReactiveControllerHost} from 'lit';

import {bound} from '../decorators/bound';

/**
 * An element that `FormController` may use.
 */
export interface FormElement extends ReactiveControllerHost, HTMLElement {
  /**
   * The `<form>` that this element is associated with.
   */
  readonly form: HTMLFormElement|null;
  /**
   * The name of the element in the form. This property should reflect to a
   * `name` attribute.
   */
  name: string;
  /**
   * Whether or not this element is disabled. If present, this property should
   * reflect to a `disabled` attribute.
   */
  disabled?: boolean;
  /**
   * A function that retrieves the current form value for this element.
   *
   * @return The current form value, or `null` if there is no value.
   */
  [getFormValue](): string|File|FormData|null;
}

/**
 * A unique symbol key for `FormController` elements to implement their
 * `getFormValue()` function.
 */
export const getFormValue = Symbol('getFormValue');

/**
 * A `ReactiveController` that adds `<form>` support to an element.
 */
export class FormController implements ReactiveController {
  private form?: HTMLFormElement|null;

  /**
   * Creates a new `FormController` for the given element.
   *
   * @param element The element to add `<form>` support to.
   */
  constructor(private readonly element: FormElement) {}

  hostConnected() {
    // If the component internals are not in Shadow DOM, subscribing to form
    // data events could lead to duplicated data, which may not work correctly
    // on the server side.
    if (!this.element.shadowRoot || window.ShadyDOM?.inUse) {
      return;
    }

    // Preserve a reference to the form, since on hostDisconnected it may be
    // null if the child was removed.
    this.form = this.element.form;
    this.form?.addEventListener('formdata', this.formDataListener);
  }

  hostDisconnected() {
    this.form?.removeEventListener('formdata', this.formDataListener);
  }

  @bound
  private formDataListener(event: FormDataEvent) {
    if (this.element.disabled) {
      // Check for truthiness since some elements may not support disabling.
      return;
    }

    const value = this.element[getFormValue]();
    // If given a `FormData` instance, append all values to the form. This
    // allows elements to customize what is added beyond a single name/value
    // pair.
    if (value instanceof FormData) {
      for (const [key, dataValue] of value) {
        event.formData.append(key, dataValue);
      }
      return;
    }

    // Do not associate the value with the form if there is no value or no name.
    if (value === null || !this.element.name) {
      return;
    }

    event.formData.append(this.element.name, value);
  }
}
