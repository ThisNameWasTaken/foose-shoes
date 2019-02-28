(() => {
  const searchFieldInput = document.querySelector('#search-text-field');
  const searchField = searchFieldInput.closest('.search-text-field');
  const searchFieldButton = searchField.querySelector('.search-text-field__button');

  searchFieldButton.addEventListener('click', event => {
    event.preventDefault();
    searchField.classList.add('search-text-field--active');
    searchFieldInput.focus();
  });

  searchFieldInput.addEventListener('blur', () =>
    searchField.classList.remove('search-text-field--active')
  );
})();

(() => {
  const searchFieldInput = document.querySelector('#text-field-search');
  const searchFieldButton = document.querySelector('#open-text-field-search-button');

  searchFieldButton.addEventListener('click', event => {
    event.preventDefault();
    searchFieldInput.classList.add('active');
    searchFieldInput.focus();
  });

  searchFieldInput.addEventListener('blur', () =>
    searchFieldInput.classList.remove('active')
  );
})();
