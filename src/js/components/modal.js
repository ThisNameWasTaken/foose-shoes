import '../utils/document-clip';
import FocusableChildren from '../utils/focusable-children';

export default class Modal {
  _siblings = [];

  static CSS_CLASSES = {
    ACTIVE: 'modal--active',
    BACKDROP: 'modal__backdrop',
    CLOSE_BUTTON: 'modal__close-button',
  };

  /**
   * @param {HTMLElement} root
   */
  constructor(root) {
    this._element = root;

    this._focusableChildren = new FocusableChildren(this._element);

    this._backdrop = this._element.querySelector(`.${Modal.CSS_CLASSES.BACKDROP}`);
    this._closeButton = this._element.querySelector(
      `.${Modal.CSS_CLASSES.CLOSE_BUTTON}`
    );

    this.close();

    this._setupMethods();
    this._addEventListeners();
  }

  /**
   * @param {HTMLElement} lastFocusedElement
   */
  open(lastFocusedElement) {
    this._lastFocusedElement = lastFocusedElement;

    this._hideSiblingsForScreenReaders();

    this._element.setAttribute('aria-hidden', 'false');

    document.clip();
    this._element.classList.add(Modal.CSS_CLASSES.ACTIVE);

    document.addEventListener('keydown', this._trapKeyboard);

    this._focusableChildren.enable();
  }

  close() {
    this._element.setAttribute('aria-hidden', 'true');

    this._hideSiblingsForScreenReaders(false);

    this._element.classList.remove(Modal.CSS_CLASSES.ACTIVE);

    this._focusableChildren.disable();

    document.unclip();
    document.removeEventListener('keydown', this._trapKeyboard);

    if (this._lastFocusedElement) {
      this._lastFocusedElement.focus();
    }
  }

  /**
   * @protected
   * @param {Boolean} hide - asserts wheter or not this element's siblings should be hidden for a screen reader
   */
  _hideSiblingsForScreenReaders(hide = true) {
    // when we hide the siblings
    if (hide) {
      // skip those that are meant to always be hidden for the screen readers
      this._siblings = Array.prototype.slice
        .call(document.body.children)
        .filter(
          sibling =>
            this._element !== sibling &&
            sibling.getAttribute('aria-hidden') !== 'true'
        );
    }

    this._siblings.forEach(sibling => sibling.setAttribute('aria-hidden', hide));
  }

  /**
   * @protected
   */
  _setupMethods() {
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
    this._trapKeyboard = this._trapKeyboard.bind(this);
  }

  /**
   * @protected
   */
  _addEventListeners() {
    this._closeButton.addEventListener('click', this.close);
    this._backdrop.addEventListener('click', this.close);
  }

  /**
   * @protected
   * @param {Event} event
   */
  _trapKeyboard(event) {
    if (event.key == 'Tab') {
      event.preventDefault();

      event.shiftKey
        ? this._focusableChildren.focusPrevious()
        : this._focusableChildren.focusNext();
    }
  }
}
