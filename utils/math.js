const _ = require('lodash');

function round(number, precision = 2) {
  return _.round(Number(number), precision);
}

/**
 * use the close value located a elem[4]
 * @param {object} ohlc
 * @returns
 */
function getMin(ohlc) {
  return _.minBy(ohlc, x => x.close);
}

function getMax(ohlc) {
  return _.maxBy(ohlc, x => x.close);
}

module.exports = {
  round,
  getMin,
  getMax,
};
