// if (!window.WebKitPlaybackTargetAvailabilityEvent) {
//   return;
// }

// add event listener when the dom is loaded
document.addEventListener('DOMContentLoaded', function () {
  const remoteButton = document.querySelector('.ytp-remote-button.ytp-button');
  console.log(remoteButton);

  // Fetch the airPlayButton element from the airPlayButton.html file
  const xhr = new XMLHttpRequest();
  xhr.open(
    'GET',
    'chrome-extension://lgnlhgebnkkjbhhajmecoooodmjblddj/airPlayButton.html'
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

      // Add an event listener to the airPlayButton to show the AirPlay airPlayButton when clicked
      // source.addEventListener(
      //   'webkitplaybacktargetavailabilitychanged',
      //   function (event) {
      //     switch (event.availability) {
      //       case 'available':
      //         airPlayButton.hidden = false;
      //         airPlayButton.disabled = false;
      //         break;
      //       case 'not-available':
      //         airPlayButton.hidden = true;
      //         airPlayButton.disabled = true;
      //         break;
      //     }
      //   }
      // );
    }
  };
  xhr.send();
});
