const CryptoCurrency = require('../models/CryptoCurrency');

/**
 * 
 * 
 * @param {object} payload the info to build new crypto currency
 * @param {string} payload.name 
 * @param {number} payload.value 
 * @param {number} payload.amountPossessed 
 * @param {number} payload.valueInEur 
 * @returns 
 */
function create(payload) {
  if (!payload) {
    return null;
  }

  const cryptoCurrency = new CryptoCurrency();

  cryptoCurrency.name = payload.name;
  cryptoCurrency.value = payload.value;
  cryptoCurrency.amountPossessed = payload.amountPossessed;
  cryptoCurrency.valueInEur = payload.valueInEur;

  return cryptoCurrency;
}

/**
 * 
 * 
 * @param {string} name 
 * @returns a newly created crypto currency, with only a name
 */
function createEmpty(name) {
  const cryptoCurrency = new CryptoCurrency();
  cryptoCurrency.name = name;
  cryptoCurrency.value = 0;
  cryptoCurrency.amountPossessed = 0;
  cryptoCurrency.valueInEur = 0;
  return cryptoCurrency;
}

module.exports = {
  create,
  createEmpty,
};
