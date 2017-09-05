const CryptoOHLC = require('../models/CryptoOHLC');

function create(payload) {
  if (!payload) {
    return null;
  }

  const cryptoOHLC = new CryptoOHLC();

  cryptoOHLC.time = payload[0];
  cryptoOHLC.open = Number(payload[1]);
  cryptoOHLC.high = Number(payload[2]);
  cryptoOHLC.low = Number(payload[3]);
  cryptoOHLC.close = Number(payload[4]);
  cryptoOHLC.vwap = Number(payload[5]);
  cryptoOHLC.volume = Number(payload[6]);
  cryptoOHLC.count = Number(payload[7]);
  cryptoOHLC.date = new Date(payload[0] * 1000).toLocaleTimeString();
  cryptoOHLC.amplitude = Number(payload[2]) - Number(payload[3]);
  cryptoOHLC.closeMinusOpen = Number(payload[4]) - Number(payload[1]);

  return cryptoOHLC;
}

module.exports = {
  create,
};
