const SlidingWindow = require('../models/SlidingWindow');

function create() {
  const slidingWindow = new SlidingWindow();
  return slidingWindow;
}

module.exports = {
  create,
};
