const CryptoWatcher = require('../models/CryptoWatcher');
const slidingWindowFactory = require('../factories/slidingWindowFactory');

function create(name, wallet) {
  if (!name) {
    return null;
  }
  const cryptoWatcher = new CryptoWatcher(wallet);
  cryptoWatcher.slidingWindow = slidingWindowFactory.create(name);

  cryptoWatcher.slidingWindow.authorizedDiffPosNeg = cryptoWatcher.authorizedDiffPosNeg;
  cryptoWatcher.slidingWindow.minProgressionOnWindow = cryptoWatcher.minProgressionOnWindow;
  cryptoWatcher.slidingWindow.minPositiveSecHalf = cryptoWatcher.minPositiveSecHalf;
  cryptoWatcher.slidingWindow.maxNegativeLastFive = cryptoWatcher.maxNegativeLastFive;

  return cryptoWatcher;
}

module.exports = {
  create,
};
