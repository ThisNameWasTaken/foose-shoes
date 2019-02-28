import Modal from './modal';

(() => {
  const button = document.querySelector('#login-or-register-button');
  const modalElement = document.querySelector('#login-or-register-modal');
  const modal = new Modal(modalElement);

  button.addEventListener('click', event => {
    event.preventDefault();
    modal.open(button);
  });
})();
