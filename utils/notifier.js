const notifier = require('node-notifier');

var Sound = require('node-aplay');

// fire and forget:
const sound = new Sound('../media/sound/3721.mp3');



let USE_NOTIFICATIONS = false;

function notify(title = 'Should BUY', message = `Value is ${buyValue}`) {
  //notify user with system notification to buy
  if (USE_NOTIFICATIONS) {
    sound.play();

    notifier.notify({
      title,
      message,
      timeout: 2,
    }, function (err, response) {
      // Response is response from notification
    });
  }
}

function setUseNotification(useNotif) {
  USE_NOTIFICATIONS = useNotif;
}

module.exports = {
  notify,
  setUseNotification,
}