import html from '../utils/html';

(async () => {
  const listItemTemplate = ({ date, text }) => html`
    <li class="list__item">
      <div class="list__item__icon">
        <div class="price-box w-inherit h-inherit">
          <div
            class="price-box__price text-white text-uppercase h6 p-2 font-weight-bolder"
          >
            ${date}
          </div>
        </div>
      </div>
      <div class="list__item__text">
        ${text}
      </div>
    </li>
  `;

  const blogNewsList = document.querySelector('#blog-news-list');

  const blogNews = await fetch('/blog-news-placeholders.json').then(res =>
    res.json()
  );

  let currentNewsIndex = 0;

  setInterval(() => {
    const displayedNewsLength = 2;

    requestAnimationFrame(() => {
      const blogNewsListItems = [...blogNewsList.children];
      blogNewsListItems.forEach(item => {
        item.classList.add('list__item--exit');

        item.addEventListener('transitionend', () => {
          item.remove();

          // if we reached the end.
          if (currentNewsIndex + 2 > blogNews.length) {
            // go back to the start
            currentNewsIndex = 0;
          }

          blogNewsList.innerHTML = blogNews
            .slice(currentNewsIndex, (currentNewsIndex += displayedNewsLength))
            .map(item => listItemTemplate(item))
            .join('');

          requestAnimationFrame(() =>
            requestAnimationFrame(() => {
              const blogNewsListItems = [...blogNewsList.children];
              blogNewsListItems.forEach(item =>
                item.classList.add('list__item--enter')
              );
            })
          );
        });
      });
    });
  }, 5000);
})();
