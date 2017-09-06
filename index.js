var sleep = require('system-sleep');
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
const clone = require('clone');
const notifier = require('node-notifier');
const path = require('path');

const bchOhlc = require('./training-data/BCHEUR.json');
const ltcOhlc = require('./training-data/LTCEUR_5_9_17.json');

const math = require('./utils/math');
const cryptoOHLCFactory = require('./factories/cryptoOHLCFactory');
const slidingWindowFactory = require('./factories/slidingWindowFactory');


const slidingWindow = slidingWindowFactory.create();
const ohlc = clone(ltcOhlc);

const USE_NOTIFICATIONS = false;

let bought = false;
let previousProgression = 0;
let previousValue = 0;
let limitToSell = 0;
let percentToMin = 0;
let buyValue = 0;

let totalSell = 0;

for (let y = 0; y < ohlc.length; y++) {
  const cryptoOhlc = cryptoOHLCFactory.create(ohlc[y]);
  // console.log('#########cryptoOhlc', JSON.stringify(cryptoOhlc, null, 2));
  // console.log('#########');
  // console.log('#########');
  slidingWindow.addCryptoOHLC(cryptoOhlc);
  decide(slidingWindow);

  sleep(10);

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
  if (differencePosNeg > 0 && slidingWindow.percentageProgressionOnWindow > 1.5 && !bought) {
    messageBuy(differencePosNeg, lastClosed);

    buyValue = lastClosed;
    bought = true;
    previousProgression = slidingWindow.percentageProgressionOnWindow;
    limitToSell = lastClosed - (trailingStopPercent * lastClosed / 100);
  }
  // if it still raises, set the new minimum to the new progress
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
  else if (bought && lastClosed < limitToSell) {

    const beneficeAbsolute = lastClosed - buyValue;
    const beneficePercent = beneficeAbsolute / buyValue * 100;
    totalSell += beneficePercent;

    // we should sell with a limit order to avoid big holes
    messageSell(beneficePercent, lastClosed);
    bought = false;

  }

  previousValue = lastClosed;
}

function notify(title = 'Should BUY', message = `Value is ${buyValue}`) {
  //notify user with system notification to buy
  if (USE_NOTIFICATIONS) {
    notifier.notify({
      title,
      message,
      timeout: 2,
    }, function (err, response) {
      // Response is response from notification
    });
  }
}

function messageBuy(differencePosNeg, lastClosed) {
  console.log('');
  console.log('#########');
  console.log('#########');
  console.log('#########BUY', slidingWindow.getTime(), '@', lastClosed);
  console.log('[Prog : ]', math.round(slidingWindow.percentageProgressionOnWindow));
  console.log('[Max Amplitude : ]', math.round(slidingWindow.maxAmplitudeOnWindow));
  console.log('[Diff pos neg : ]', math.round(differencePosNeg));
  console.log('#########');
  console.log('#########');
  console.log('');

  notify('SHOULD BUY', `value is ${lastClosed}`);
}

function messageSell(beneficePercent, lastClosed) {
  console.log('#########');
  console.log('#########');
  console.log('#########SELL',
    slidingWindow.getTime(),
    '@', lastClosed);
  console.log('[Benefice :] ', math.round(beneficePercent), '%');
  console.log('[Total Sell :] ', math.round(totalSell), '%');
  console.log('#########');
  console.log('#########');
  notify('Should SELL', `Value is ${lastClosed}`);
}
