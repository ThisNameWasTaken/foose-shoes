(async () => {
  const searchFieldInput = document.querySelector('#search-text-field');
  const searchField = searchFieldInput.closest('.search-text-field');
  const searchFieldButton = searchField.querySelector('.search-text-field__button');
  const searchFieldResults = searchField.querySelector(
    '.search-text-field__results'
  );

  searchFieldButton.addEventListener('click', event => {
    event.preventDefault();
    searchField.classList.add('search-text-field--active');
    searchFieldInput.focus();
  });

  searchFieldInput.addEventListener('focus', updateSearchResults);

  searchFieldInput.addEventListener('blur', () =>
    searchField.classList.remove('search-text-field--active')
  );

  searchFieldInput.addEventListener('keyup', updateSearchResults);

  const searchFieldKeywords = await fetch('/search-field-keywords.json').then(res =>
    res.json()
  );

  function updateSearchResults() {
    searchFieldResults.innerHTML = searchFieldInput.value
      ? searchFieldKeywords
          .filter(keyword =>
            keyword.toLowerCase().includes(searchFieldInput.value.toLowerCase())
          )
          .slice(0, 5)
          .map(
            result =>
              `<div class="search-text-field__results__result">${result}</div>`
          )
          .join('')
      : '';
  }
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
