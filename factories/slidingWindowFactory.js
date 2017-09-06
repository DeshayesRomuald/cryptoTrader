const SlidingWindow = require('../models/SlidingWindow');

function create(cryptoName) {
  const slidingWindow = new SlidingWindow(cryptoName);
  return slidingWindow;
}

module.exports = {
  create,
};
