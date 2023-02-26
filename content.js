document.addEventListener('DOMContentLoaded', function () {
  const remoteButton = document.querySelector('.ytp-remote-button.ytp-button');
  console.log(remoteButton);

  // Fetch the airPlayButton element from the airPlayButton.html file
  const xhr = new XMLHttpRequest();
  xhr.open(
    'GET',
    'chrome-extension://lgnlhgebnkkjbhhajmecoooodmjblddj/components/Button.html'
  );
  xhr.onload = function () {
    if (xhr.status === 200) {
      // Parse the HTML string and get the airPlayButton element
      const parser = new DOMParser();
      const document = parser.parseFromString(xhr.response, 'text/html');

      const airPlayButton = document.getElementById('airPlayButton');
      console.log(airPlayButton);

      // Add the airPlayButton element to the div element
      remoteButton.insertAdjacentElement('afterend', airPlayButton);

      airPlayButton.addEventListener('click', function () {
        const videoId = getYouTubeVideoId();
        const quality = 'best';
        chrome.extension.sendMessage({
          action: 'playVideo',
          videoId: videoId,
          quality: quality,
        });
        function getYouTubeVideoId() {
          // Get the YouTube video ID from the URL
          const regex = /v=([^&#]*)/;
          const match = regex.exec(window.location.search);
          if (match && match.length > 1) {
            return match[1];
          }
          return null;
        }
      });
    }
  };
  xhr.send();
});
