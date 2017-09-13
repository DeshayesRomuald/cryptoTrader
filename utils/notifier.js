const notifier = require('node-notifier');

const Sound = require('node-aplay');

// fire and forget:
const sound = new Sound('../media/sound/bicycle_bell.wav');

let USE_NOTIFICATIONS = false;

function notify(title = 'Should BUY', message) {
  // notify user with system notification to buy
  if (USE_NOTIFICATIONS) {
    sound.play();
    notifier.notify({
      title,
      message,
      timeout: 2,
    });
  }
}

function setUseNotification(useNotif) {
  USE_NOTIFICATIONS = useNotif;
}

module.exports = {
  notify,
  setUseNotification,
};
