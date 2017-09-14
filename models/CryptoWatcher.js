const math = require('../utils/math');
const { notify } = require('../utils/notifier');
const cryptoCurrencyFactory = require('../factories/cryptoCurrencyFactory');

const FEES = 0.26;
const AMOUNT_PER_TRANSACTION = 100;

const CryptoWatcher = function CryptoWatcher(wallet) {
  this.cryptoWallet = wallet;
  this.slidingWindow = null;
  this.bought = false;
  this.previousProgression = 0;
  this.previousValue = 0;
  this.limitToSell = 0;
  this.buyValue = 0;

  this.totalSell = 0;
  this.transactionsCompleted = 0;
  this.trailingStopPercent = 0;

  // at first trailing stop is set to high value, to try to rebound
  this.initTrailingStop = 10;
  this.smallerTrailingStop = 1.2;
  this.trailingStopMultiplier = this.initTrailingStop; // 0.5
  this.minPositiveOnWindow = 13; // 12
  this.minProgressionOnWindow = 0.5; // 1.1
  this.minPositiveSecHalf = 4; // 4
  this.maxNegativeLastFive = 1; // 1
  this.diffMeanLowestMultiplicator = 100; // 2
};

CryptoWatcher.prototype.add = function add(cryptoOhlc) {
  if (!cryptoOhlc) {
    return;
  }
  this.slidingWindow.addCryptoOHLC(cryptoOhlc);

  // update the value of the wallet when a new cryptoValue is received
  const cryptoCurency = cryptoCurrencyFactory.create({
    name: this.slidingWindow.cryptoName,
    value: cryptoOhlc.close,
    amountPossessed: 0,
    valueInEur: 0,
  });
  this.cryptoWallet.update(cryptoCurency);

  this.decide();
};

/**
 * could be recalculated every iteration, such that when rate is above bought value, trailing stop gets tighter
 * this way, we could limit the loss.
 * I have noted that sometimes, value drops quite a bit just after buying, so maybe should i let it raise back,
 * if i can not understand why it drops just after i bought
 *
 * for example i could try to predict that next tick is going to be a raise of rate, then set the trailing stop
 * directly to a very small value above buy value (supposing first guess was right and it went up)
 */
CryptoWatcher.prototype.estimateTrailingStopPercent = function estimateTrailingStopPercent() {
  // const meanStickSize = this.slidingWindow.meanCandleSizeInPercent;
  // const stdDevCandleSizePercent = this.slidingWindow.stdDevCandleSizePercent;
  // ~99% of candle size in window are smaller than this, should
  // generally 2 iterations going down before selling
  this.trailingStopPercent = 1 * this.trailingStopMultiplier;
  return this.trailingStopPercent;
};


// implement a trailing stop
// as long as it raises, keep it, when it stops, sell it.
CryptoWatcher.prototype.decide = function decide() {
  const lastClosed = this.slidingWindow.getLast().close;

  // BUY CRITERIA
  if (this.slidingWindow.previousPositivesOrZero >= this.minPositiveOnWindow &&
    this.slidingWindow.percentageProgressionOnWindow >= this.minProgressionOnWindow &&
    this.slidingWindow.numberPositiveSecondHalf >= this.minPositiveSecHalf &&
    this.slidingWindow.numberNegativeLastFive <= this.maxNegativeLastFive &&
    this.slidingWindow.differenceMeanLowest * this.diffMeanLowestMultiplicator > this.slidingWindow.percentageProgressionOnWindow &&
    !this.bought) {
    // trailing stop width should be based on std dev at buy, not reevaluated every iterarion
    this.estimateTrailingStopPercent();

    this.buyValue = lastClosed;
    this.bought = true;
    this.previousProgression = this.slidingWindow.percentageProgressionOnWindow;
    this.limitToSell = lastClosed - (this.trailingStopPercent * lastClosed / 100);

    const crypto = cryptoCurrencyFactory.create({
      name: this.slidingWindow.cryptoName,
      value: lastClosed,
      amountPossessed: AMOUNT_PER_TRANSACTION / lastClosed,
      valueInEur: AMOUNT_PER_TRANSACTION,
    });
    this.cryptoWallet.buyCrypto(crypto);

    this.messageBuy(lastClosed);
  }

  // if it still raises, set the new minimum to the new progress
  // RAISE TRAILING STOP
  else if (this.bought && lastClosed >= this.previousValue) {
    // if lastClosed has grown more than 1.26% since buyValue, set trailing stop to small amount
    // before that, big trailing stop let's say 25%
    this.tryToReduceTrailingStop(lastClosed);

    const newLimitToSell = lastClosed - ((this.trailingStopPercent * lastClosed) / 100);
    // it is still possible that value has lowered in previous iteration,
    // but less than 1%, then it grow back. In this case, we must not set
    // a min that is lower than the previous
    // If we did, there would be a risk to fall to zero if each iteration
    // goes down 0.5% then goes up 0.1% the next iteration.
    if (newLimitToSell > this.limitToSell) {
      this.limitToSell = newLimitToSell;
      console.log(`new MIN [${this.slidingWindow.cryptoName}] : ${math.round(this.limitToSell, 4)}`);
    }
  }

  // SELL CRITERIA
  else if (this.bought && lastClosed < this.limitToSell) {
    const beneficeAbsolute = lastClosed - this.buyValue;
    const beneficePercent = ((beneficeAbsolute / this.buyValue) * 100) - FEES;
    this.totalSell += beneficePercent;
    this.transactionsCompleted += 1;


    // I need to sell the amount of crypto bought to cash in the benefice
    const amountBought = AMOUNT_PER_TRANSACTION / this.buyValue;
    this.cryptoWallet.sellCrypto(cryptoCurrencyFactory.create({
      name: this.slidingWindow.cryptoName,
      value: lastClosed,
      amountPossessed: amountBought,
      valueInEur: lastClosed * amountBought,
    }));

    // we should sell with a limit order to avoid big holes
    this.messageSell(beneficePercent, lastClosed);

    this.bought = false;
    this.trailingStopMultiplier = this.initTrailingStop;
  }

  this.previousValue = lastClosed;
};

CryptoWatcher.prototype.tryToReduceTrailingStop = function tryToReduceTrailingStop(lastClosed) {
  if (
    lastClosed / this.buyValue > (1 + (this.smallerTrailingStop / 100)) &&
    this.trailingStopPercent === this.initTrailingStop
  ) {
    console.log('SET Small Trailing Stop');
    this.trailingStopPercent = this.smallerTrailingStop;
  }
};

CryptoWatcher.prototype.getTotalSell = function getTotalSell() {
  return this.totalSell;
};

CryptoWatcher.prototype.messageBuy = function messageBuy(lastClosed) {
  console.log('');
  console.log('');
  console.log('#################################################################################');
  console.log('#################################################################################');
  console.log('#########                                                                       #');
  console.log('#########BUY',
    this.slidingWindow.cryptoName,
    this.slidingWindow.getTime(), '@', lastClosed, '<<<<<');
  console.log('[Prog : ]', math.round(this.slidingWindow.percentageProgressionOnWindow), '%');
  console.log('[Max Amplitude : ]', math.round(this.slidingWindow.maxAmplitudeOnWindow), '%');
  console.log('[previousPositivesOrZero ]', this.slidingWindow.previousPositivesOrZero);
  console.log('[numberPositiveSecondHalf]', this.slidingWindow.numberPositiveSecondHalf);
  console.log('[Neg last 5]', this.slidingWindow.numberNegativeLastFive);
  console.log('[Trailing stop]', this.trailingStopPercent, '%');
  console.log('[Limit Sell]', this.limitToSell);
  console.log('[Diff Mean Lowest]', this.slidingWindow.differenceMeanLowest, '%');
  console.log('#########                                                                       #');
  console.log('#################################################################################');


  notify(`You should BUY some ${this.slidingWindow.cryptoName}`,
    `Its value is ${lastClosed}`);
};

CryptoWatcher.prototype.messageSell = function messageSell(beneficePercent, lastClosed) {
  const amountBought = AMOUNT_PER_TRANSACTION / this.buyValue;
  console.log('#########                                                                       #');
  console.log('#########SELL',
    this.slidingWindow.cryptoName,
    this.slidingWindow.getTime(),
    '@', lastClosed, '>>>>>');
  console.log('[Benefice :] ', math.round(beneficePercent), '%');
  console.log('[Total Sell :] ',
    math.round(this.totalSell),
    `% in ${this.transactionsCompleted} transactions`);
  console.log(`[AmountBought : ${amountBought}]`);
  console.log(`[Buy Value : ${this.buyValue}]`);
  console.log(`[Sell Value : ${lastClosed * amountBought}]`);
  console.log('#########                                                                       #');
  console.log('#################################################################################');
  console.log('#################################################################################');
  console.log('');
  console.log('');

  notify(`It's time to sell your ${this.slidingWindow.cryptoName}`,
    `Its Value is ${lastClosed}, \nyou made ${math.round(beneficePercent)}% benefice`);
};

module.exports = CryptoWatcher;
