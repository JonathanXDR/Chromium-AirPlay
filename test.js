const browser = require('airplay').createBrowser();
browser.on('deviceOnline', function (device) {
  console.log('device online: ' + device.id);
  device.play('https://www.youtube.com/watch?v=-Z66Gt6kHyA', 0);
});
browser.on('deviceOffline', function (device) {
  console.log('device offline: ' + device.id);
});
browser.start();
