var sleep = require('system-sleep');
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
const clone = require('clone');
const path = require('path');

const bchOhlc = require('./training-data/BCHEUR.json');
const bchOhlc6 = require('./training-data/BCH_6_9_17.json');
const ethOhlc = require('./training-data/ETHEUR_6_9_17.json');
const ltcOhlc = require('./training-data/LTCEUR_5_9_17.json');
const ltcOhlc6 = require('./training-data/LTCEUR_6_9_17.json');
const ltcOhlc15m = require('./training-data/LTCEUR15min.json');
const eth5m = require('./training-data/ETH5min.json');

const math = require('./utils/math');
const { notify } = require('./utils/notifier');
const cryptoOHLCFactory = require('./factories/cryptoOHLCFactory');
const slidingWindowFactory = require('./factories/slidingWindowFactory');


const slidingWindow = slidingWindowFactory.create('LiteCoin');
const ohlc = clone(bchOhlc6);

const SLEEP_BETWEEN_TRANSACTION = 0;
const SLEEP_BETWEEN_DATA = 0;

let bought = false;
let previousProgression = 0;
let previousValue = 0;
let limitToSell = 0;
let percentToMin = 0;
let buyValue = 0;

let totalSell = 0;
let transactionsCompleted = 0;

for (let y = 0; y < ohlc.length; y++) {
  const cryptoOhlc = cryptoOHLCFactory.create(ohlc[y]);
  slidingWindow.addCryptoOHLC(cryptoOhlc);
  const trailingStopPercent = estimateTrailingStopPercent(slidingWindow);
  decide(slidingWindow, 1); // trailingStopPercent

  sleep(SLEEP_BETWEEN_DATA);

}

function estimateTrailingStopPercent(slidingWindow) {
  const meanStickSize = slidingWindow.meanCandleSizeInPercent;
  const stdDevCandleSizePercent = slidingWindow.stdDevCandleSizePercent;

  // ~87% of candle size in window are smaller than this, should
  // generally 2 iterations going down before selling
  return 2 * stdDevCandleSizePercent;
}



// implement a trailing stop
// as long as it raises, keep it, when it stops, sell it.
function decide(slidingWindow, trailingStopPercent = 1) {
  let differencePosNeg = 0;

  if (slidingWindow.previousNegatives !== 0) {
    differencePosNeg = slidingWindow.previousPositivesOrZero - slidingWindow.previousNegatives;
  }

  const lastClosed = slidingWindow.getLast().close;
  // console.log('#########VALUE', JSON.stringify(lastClosed, null, 2));
  // console.log('#########differencePosNeg', JSON.stringify(differencePosNeg, null, 2));

  // more positive than negative in the window and a progression over 1.5% on window
  // BUY
  if (differencePosNeg > -5 &&
    slidingWindow.percentageProgressionOnWindow > 1.5 &&
    slidingWindow.numberPositiveSecondHalf > 4 &&
    slidingWindow.numberNegativeLastFive <= 2 &&
    !bought) {
    messageBuy(differencePosNeg, lastClosed);
    console.log('#########previousPositivesOrZero', slidingWindow.previousPositivesOrZero);
    console.log('#########numberPositiveSecondHalf', slidingWindow.numberPositiveSecondHalf);
    sleep(SLEEP_BETWEEN_TRANSACTION);


    buyValue = lastClosed;
    bought = true;
    previousProgression = slidingWindow.percentageProgressionOnWindow;
    limitToSell = lastClosed - (trailingStopPercent * lastClosed / 100);
  }

  // if it still raises, set the new minimum to the new progress
  // RAISE TRAILING STOP
  else if (bought && lastClosed >= previousValue) {
    const newLimitToSell = lastClosed - (trailingStopPercent * lastClosed / 100);
    // it is still possible that value has lowered in previous iteration,
    // but less than 1%, then it grow back. In this case, we must not set
    // a min that is lower than the previous
    // If we did, there would be a risk to fall to zero if each iteration
    // goes down 0.5% then goes up 0.1% the next iteration.
    if (newLimitToSell > limitToSell) {
      limitToSell = newLimitToSell;
      console.log('new MIN ', math.round(limitToSell, 4));
    }
  }

  // has lower more than 1%  wrt trailing stop then sell
  // SELL
  else if (bought && lastClosed < limitToSell) {

    const beneficeAbsolute = lastClosed - buyValue;
    const beneficePercent = beneficeAbsolute / buyValue * 100;
    totalSell += beneficePercent;
    transactionsCompleted++;

    // we should sell with a limit order to avoid big holes
    messageSell(beneficePercent, lastClosed, transactionsCompleted);
    sleep(SLEEP_BETWEEN_TRANSACTION);

    bought = false;

  }

  previousValue = lastClosed;
}

function messageBuy(differencePosNeg, lastClosed) {
  console.log('');
  console.log('#########');
  console.log('#########');
  console.log('#########BUY', slidingWindow.getTime(), '@', lastClosed, '<<<<<');
  console.log('[Prog : ]', math.round(slidingWindow.percentageProgressionOnWindow));
  console.log('[Max Amplitude : ]', math.round(slidingWindow.maxAmplitudeOnWindow));
  console.log('[Diff pos neg : ]', math.round(differencePosNeg));

  notify(`You should BUY some ${slidingWindow.cryptoName}`,
    `Its value is ${lastClosed}`);
}

function messageSell(beneficePercent, lastClosed, transactionsCompleted) {
  console.log('#########');
  console.log('#########SELL',
    slidingWindow.getTime(),
    '@', lastClosed, '>>>>>');
  console.log('[Benefice :] ', math.round(beneficePercent), '%');
  console.log('[Total Sell :] ',
    math.round(totalSell),
    `% in ${transactionsCompleted} transactions`);
  console.log('#########');
  console.log('');

  notify(`It's time to sell your ${slidingWindow.cryptoName}`,
    `Its Value is ${lastClosed}, \nyou made ${math.round(beneficePercent)}% benefice`);
}
