const CryptoCurrency = function CryptoCurrency() {
    this.name = null;
    this.value = 0;
    this.amountPossessed = 0;
    this.valueInEur = 0;
};

/**
 * 
 * 
 * @param {number} amount 
 * @param {number} newRate 
 */
function buy(amount, newRate) {
    this.amountPossessed += amount;
    this.changeRate(newRate);
}
CryptoCurrency.prototype.buy = buy;

/**
 * 
 * 
 * @param {number} amount 
 * @param {number} newRate 
 */
function sell(amount, newRate) {
    if (amount > this.amountPossessed) {
        throw new Exception('can not sell more crypto than possessed');
    }
    this.amountPossessed -= amount;
    this.changeRate(newRate);
}
CryptoCurrency.prototype.sell = sell;

/**
 * 
 * 
 * @param {number} newRate 
 */
function changeRate(newRate) {
    this.value = newRate;
    this.valueInEur = this.amountPossessed * this.value;
}
CryptoCurrency.prototype.changeRate = changeRate;



module.exports = CryptoCurrency;
