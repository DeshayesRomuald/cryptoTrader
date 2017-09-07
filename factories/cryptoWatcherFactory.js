const CryptoWatcher = require('../models/CryptoWatcher');
const slidingWindowFactory = require('../factories/slidingWindowFactory');

function create(name) {
  if (!name) {
    return null;
  }
  const cryptoWatcher = new CryptoWatcher();
  cryptoWatcher.slidingWindow = slidingWindowFactory.create(name);
  return cryptoWatcher;
}

module.exports = {
  create,
};
