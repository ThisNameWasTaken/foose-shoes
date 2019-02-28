import html from '../utils/html';

(async () => {
  // TODO: Refactor, this looks a lot like the blog news widget
  const tweetList = document.querySelector('#tweet-list');

  const tweetTemplate = ({ date, text }) => html`
    <p class="card-text tweet">
      ${text}
      <em class="pt-1 d-block">${date}</em>
    </p>
  `;

  const tweets = await fetch('/tweets-placeholders.json').then(res => res.json());

  let currentTweetIndex = 0;
  const displayedNewsLength = 2;

  setInterval(() => {
    requestAnimationFrame(() => {
      const tweetListItems = [...tweetList.children];

      tweetListItems.forEach(item => {
        item.classList.add('tweet--exit');

        item.addEventListener('transitionend', () => {
          item.remove();

          currentTweetIndex %= tweets.length;

          tweetList.innerHTML = tweets
            .slice(currentTweetIndex, currentTweetIndex + displayedNewsLength)
            .map(item => tweetTemplate(item))
            .join('');

          currentTweetIndex++;

          requestAnimationFrame(() =>
            requestAnimationFrame(() => {
              const tweetListItems = [...tweetList.children];
              tweetListItems.forEach(item => item.classList.add('tweet--enter'));
            })
          );
        });
      });
    });
  }, 5000);
})();
