import Modal from './modal';

(() => {
  const button = document.querySelector('#navbar-menu');
  const modalElement = document.querySelector('#mobile-menu-modal');
  const modal = new Modal(modalElement);

  button.addEventListener('click', event => {
    event.preventDefault();
    modal.open(button);
  });
})();
