const FOCUSABLE_ELEMENTS_SELECTOR =
  'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]';

export default class FocusableChildren {
  /**
   * @param {HTMLElement} element
   */
  constructor(element) {
    this._elements = element.querySelectorAll(FOCUSABLE_ELEMENTS_SELECTOR);
    this._focusedElementIndex = 0;
  }

  /**
   * @returns {NodeList}
   */
  get nodeList() {
    return this._elements;
  }

  enable() {
    if (!this._elements) {
      return;
    }

    for (let i = 0; i < this._elements.length; i++) {
      const element = this._elements[i];
      element.removeAttribute('disabled');
      element.setAttribute('tabindex', '0');
    }
  }

  disable() {
    if (!this._elements) {
      return;
    }

    for (let i = 0; i < this._elements.length; i++) {
      const element = this._elements[i];
      element.setAttribute('disabled', 'true');
      element.setAttribute('tabindex', '-1');
    }
  }

  /**
   * @param {number} index
   */
  focus(index) {
    if (!this._elements) {
      return;
    }

    this._focusedElementIndex = index % this._elements.length;
    if (this._focusedElementIndex < 0) {
      this._focusedElementIndex += this._elements.length;
    }

    this._elements[this._focusedElementIndex].focus();
  }

  focusNext() {
    this.focus(this._focusedElementIndex + 1);
  }

  focusPrevious() {
    this.focus(this._focusedElementIndex - 1);
  }

  /**
   * Performs the specified action for each node in an list.
   * @typedef {((value: Node, key: number, parent: NodeListOf<Node>) => void)} forEachCallback
   * @param {forEachCallback} callbackfn A function that accepts up to three arguments. forEach calls the callbackfn function one time for each element in the list.
   */
  forEach(callbackfn) {
    return this._elements.forEach((element, key, parent) =>
      callbackfn(element, key, parent)
    );
  }
}
