const cryptoCurrencyFactory = require('../factories/cryptoCurrencyFactory');

/**
 * 
 */
const CryptoWallet = function CryptoWallet() {
  this.balanceInEur = 0;
  this.cryptoCurrencies = [];
};




/**
 * adds a new crypto currency to the wallet
 * if some amount is already present in the added crypto currency,
 * try to buy it for fiat
 * 
 * @param {CryptoCurrency} currency 
 * @returns {CryptoCurrency | null} the added currency or null
 * if currency was not added
 */
function addCryptoCurrency(currency) {
  if (alreadyThere(currency)) {
    return null;
  }
  // look if there is already some existing amount in added currency,
  // in order to remove fiat
  this.cryptoCurrencies.push(cryptoCurrencyFactory.createEmpty(currency.name));
  if (currency.amountPossessed !== 0) {
    try {
      buyCrypto(currency.amountPossessed, currency.name);
    } catch (err) { return null; }
  }
  return currency;
}
CryptoWallet.prototype.addCryptoCurrency = addCryptoCurrency;




/**
 * 
 * 
 * @param {CryptoCurrency} currency 
 * @returns {boolean} true iff currency name is already present
 */
function alreadyThere(currency) {
  return this.cryptoCurrencies.find(elem => elem.name === currency.name) !== undefined;
}
SlidingWindow.prototype.alreadyThere = alreadyThere;




/**
 * 
 * 
 * @param {CryptoCurrency} currency 
 * @returns {CryptoCurrency} the currency whose name match the one given in param, undefined otherwise
 */
function get(currency) {
  return this.cryptoCurrencies.find(elem => elem.name === currency.name);
}
SlidingWindow.prototype.get = get;




/**
 * 
 * 
 * @param {number} amount 
 */
function addFiat(amount) {
  this.balanceInEur += amount;
}
CryptoWallet.prototype.addFiat = addFiat;




/**
 * 
 * 
 * @param {number} amount 
 * @throws {Exception} can not exchange more fiat than possessed 
 */
function withdrawFiat(amount) {
  if (amount > this.balanceInEur) {
    throw new Exception('can not exchange more fiat than possessed');
  }
  this.balanceInEur -= amount;
}
CryptoWallet.prototype.withdrawFiat = withdrawFiat;




/**
 * 
 * 
 * @param {CryptoCurrency} cryptoCurrency 
 * @throws {Exception} can not exchange more fiat than possessed 
 */
function buyCrypto(cryptoCurrency) {
  const crypto = get(cryptoCurrency);
  //order is important, first sell, then buy
  this.withdrawFiat(cryptoCurrency.valueInEur)
  crypto.buy(cryptoCurrency.amount, cryptoCurrency.value);
}
CryptoWallet.prototype.buyCrypto = buyCrypto;




/**
 * 
 * 
 * @param {CryptoCurrency} cryptoCurrency 
 * @throws {Exception} can not sell more crypto than possessed
 */
function sellCrypto(cryptoCurrency) {
  const crypto = get(cryptoCurrency);
  //order is important, first sell, then buy
  crypto.sell(cryptoCurrency.amount, cryptoCurrency.value); 
  this.addFiat(cryptoCurrency.valueInEur)
 }
CryptoWallet.prototype.sellCrypto = sellCrypto;

/**
 * 
 * recalculates new value of a given crypto as well
 * as this.balanceInEur
 * @param {CryptoCurrency} cryptoCurrency 
 */
function update(cryptoCurrency) {
  // the amount possessed with old rate
  const currentCryptoInWallet = get(cryptoCurrency);
  const oldCryptoInWalletValue = currentCryptoInWallet.valueInEur;
  currentCryptoInWallet.changeRate(cryptoCurrency.value);

  const difference = currentCryptoInWallet.valueInEur - oldCryptoInWalletValue;
  this.valueInEur += difference;
}
CryptoWallet.prototype.update = update;

module.exports = CryptoWallet;
