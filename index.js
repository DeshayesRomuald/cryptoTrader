var sleep = require('system-sleep');
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
const clone = require('clone');

const bchOhlc = require('./training-data/BCHEUR.json');
const ltcOhlc = require('./training-data/LTCEUR_5_9_17.json');

const math = require('./utils/math');
const cryptoOHLCFactory = require('./factories/cryptoOHLCFactory');
const slidingWindowFactory = require('./factories/slidingWindowFactory');


const slidingWindow = slidingWindowFactory.create();
const ohlc = clone(ltcOhlc);

let bought = false;
let previousProgression = 0;
let limitToSell = 0;
let percentToMin = 0;

for (let y = 0; y < ohlc.length; y++) {
  const cryptoOhlc = cryptoOHLCFactory.create(ohlc[y]);
  // console.log('#########cryptoOhlc', JSON.stringify(cryptoOhlc, null, 2));
  // console.log('#########');
  // console.log('#########');
  slidingWindow.addCryptoOHLC(cryptoOhlc);
  decide(slidingWindow);

  sleep(20);

}



// implement a trailing stop
// as long as it raises, keep it, when it stops, sell it.
function decide(slidingWindow) {
  let differencePosNeg = 0;

  if (slidingWindow.previousNegatives !== 0) {
    differencePosNeg = slidingWindow.previousPositivesOrZero - slidingWindow.previousNegatives;
  }

  // console.log('#########differencePosNeg', JSON.stringify(differencePosNeg, null, 2));

  // more positive than negative in the window and a progression over 1.5% on window
  if (differencePosNeg > 0 && slidingWindow.percentageProgressionOnWindow > 1.5 && !bought) {
    console.log('#########BUY',
      math.round(slidingWindow.percentageProgressionOnWindow),
      math.round(differencePosNeg),
      slidingWindow.getTime(),
      slidingWindow.getLast().close);
    console.log('#########');
    console.log('#########');

    bought = true;
    previousProgression = slidingWindow.percentageProgressionOnWindow;
    limitToSell = slidingWindow.getLast().close;
  }
  // if it still raises, set the new minimum to the new progress
  else if (bought && slidingWindow.getLast().close > limitToSell) {
    limitToSell = slidingWindow.getLast().close;
    console.log('new MIN ', limitToSell);
  }
  // has lower more than 1% then sell
  else if (bought && slidingWindow.getLast().close < limitToSell){
    // when progression lowers between two steps, the value has lowered.
    // check if it has gone down more than 1%
    let percentToMin = (limitToSell - slidingWindow.getLast().close) / limitToSell * 100
    console.log('#########percentToMin', JSON.stringify(percentToMin, null, 2));

    if (bought && percentToMin < -1) {
      console.log('#########SELL',
        math.round(slidingWindow.percentageProgressionOnWindow),
        math.round(differencePosNeg),
        slidingWindow.getTime(),
        slidingWindow.getLast().close);
      console.log('#########');
      console.log('#########');
    }
  }
}
