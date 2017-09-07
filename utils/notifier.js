const notifier = require('node-notifier');

const USE_NOTIFICATIONS = true;

function notify(title = 'Should BUY', message = `Value is ${buyValue}`) {
  //notify user with system notification to buy
  if (USE_NOTIFICATIONS) {
    notifier.notify({
      title,
      message,
      timeout: 2,
    }, function (err, response) {
      // Response is response from notification
    });
  }
}

module.exports = {
  notify,
}