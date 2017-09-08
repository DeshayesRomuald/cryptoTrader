var sleep = require('system-sleep');
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
const clone = require('clone');
const path = require('path');

const math = require('../utils/math');
const { notify } = require('../utils/notifier');
const cryptoOHLCFactory = require('../factories/cryptoOHLCFactory');
const slidingWindowFactory = require('../factories/slidingWindowFactory');

const SLEEP_BETWEEN_TRANSACTION = 0;
const SLEEP_BETWEEN_DATA = 0;
const FEES = 0.26;

const CryptoWatcher = function CryptoWatcher() {
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
  this.smallerTrailingStop = 1;
  this.trailingStopMultiplier = this.initTrailingStop; // 0.5
  this.authorizedDiffPosNeg = 4; // 4
  this.minProgressionOnWindow = 1.1; // 1.5
  this.minPositiveSecHalf = 4; // 4
  this.maxNegativeLastFive = 0; // 1
  this.diffMeanLowestMultiplicator = 100; // 2
};

CryptoWatcher.prototype.add = function add(cryptoOhlc) {
  this.slidingWindow.addCryptoOHLC(cryptoOhlc);
  this.decide();

  sleep(SLEEP_BETWEEN_DATA);

}

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
  const meanStickSize = this.slidingWindow.meanCandleSizeInPercent;
  const stdDevCandleSizePercent = this.slidingWindow.stdDevCandleSizePercent;

  // ~99% of candle size in window are smaller than this, should
  // generally 2 iterations going down before selling
  this.trailingStopPercent = 1 * this.trailingStopMultiplier;
  return this.trailingStopPercent;
}



// implement a trailing stop
// as long as it raises, keep it, when it stops, sell it.
CryptoWatcher.prototype.decide = function decide() {
  let differencePosNeg = 0;

  if (this.slidingWindow.previousNegatives !== 0) {
    differencePosNeg = this.slidingWindow.previousPositivesOrZero - this.slidingWindow.previousNegatives;
  }

  const lastClosed = this.slidingWindow.getLast().close;
  // BUY CRETIERIA
  if (differencePosNeg > this.authorizedDiffPosNeg &&
    this.slidingWindow.percentageProgressionOnWindow > this.minProgressionOnWindow &&
    this.slidingWindow.numberPositiveSecondHalf > this.minPositiveSecHalf &&
    this.slidingWindow.numberNegativeLastFive <= this.maxNegativeLastFive &&
    this.slidingWindow.differenceMeanLowest * this.diffMeanLowestMultiplicator > this.slidingWindow.percentageProgressionOnWindow &&
    !this.bought) {
      // trailing stop width should be based on std dev at buy, not reevaluated every iterarion
      this.estimateTrailingStopPercent();

      this.buyValue = lastClosed;
      this.bought = true;
      this.previousProgression = this.slidingWindow.percentageProgressionOnWindow;
      this.limitToSell = lastClosed - (this.trailingStopPercent * lastClosed / 100);

      this.messageBuy(differencePosNeg, lastClosed);
      sleep(SLEEP_BETWEEN_TRANSACTION);
  }

  // if it still raises, set the new minimum to the new progress
  // RAISE TRAILING STOP
  else if (this.bought && lastClosed >= this.previousValue) {

    //if lastClosed has grown more than 1.26% since buyValue, set trailing stop to small amount
    // before that, big trailing stop let's say 25%
    this.tryToReduceTrailingStop(lastClosed);

    const newLimitToSell = lastClosed - (this.trailingStopPercent * lastClosed / 100);
    // it is still possible that value has lowered in previous iteration,
    // but less than 1%, then it grow back. In this case, we must not set
    // a min that is lower than the previous
    // If we did, there would be a risk to fall to zero if each iteration
    // goes down 0.5% then goes up 0.1% the next iteration.
    if (newLimitToSell > this.limitToSell) {
      this.limitToSell = newLimitToSell;
      console.log('new MIN ', math.round(this.limitToSell, 4));
    }
  }

  // SELL CRITERIA
  else if (this.bought && lastClosed < this.limitToSell) {

    const beneficeAbsolute = lastClosed - this.buyValue;
    const beneficePercent = beneficeAbsolute / this.buyValue * 100 - FEES;
    this.totalSell += beneficePercent;
    this.transactionsCompleted++;

    // we should sell with a limit order to avoid big holes
    this.messageSell(beneficePercent, lastClosed);
    sleep(SLEEP_BETWEEN_TRANSACTION);

    this.bought = false;
    this.trailingStopMultiplier = this.initTrailingStop;
  }

  this.previousValue = lastClosed;
}

CryptoWatcher.prototype.tryToReduceTrailingStop = function tryToReduceTrailingStop(lastClosed) {
  if (
    lastClosed / this.buyValue > (1 + this.smallerTrailingStop / 100) &&
    this.trailingStopPercent === this.initTrailingStop
  ) {
      console.log('SET Small Trailing Stop');
      this.trailingStopPercent = this.smallerTrailingStop;
    }
}

CryptoWatcher.prototype.messageBuy = function messageBuy(differencePosNeg, lastClosed) {
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
  console.log('[Diff pos neg : ]', math.round(differencePosNeg));
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
}

CryptoWatcher.prototype.messageSell = function messageSell(beneficePercent, lastClosed) {
  console.log('#########                                                                       #');
  console.log('#########SELL',
    this.slidingWindow.cryptoName,
    this.slidingWindow.getTime(),
    '@', lastClosed, '>>>>>');
  console.log('[Benefice :] ', math.round(beneficePercent), '%');
  console.log('[Total Sell :] ',
    math.round(this.totalSell),
    `% in ${this.transactionsCompleted} transactions`);
  console.log('#########                                                                       #');
  console.log('#################################################################################');
  console.log('#################################################################################');
  console.log('');
  console.log('');

  notify(`It's time to sell your ${this.slidingWindow.cryptoName}`,
    `Its Value is ${lastClosed}, \nyou made ${math.round(beneficePercent)}% benefice`);
}

module.exports = CryptoWatcher;
