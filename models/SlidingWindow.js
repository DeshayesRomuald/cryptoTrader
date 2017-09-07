const math = require('../utils/math');


// we will keep a sliding window of size SIZE. This is the size of the array
const SIZE = 20;

/** *********************************************************************************
 *  Helper;
 *
 ** *********************************************************************************/
const SlidingWindow = function SlidingWindow(cryptoName) {
  // array of SIZE last CryptoOHLC values
  this.cryptoValues = [];
  // number of previous positive bars in the array
  this.previousPositivesOrZero = 0;
  // number of previous negative bars in the array
  this.previousNegatives = 0;
  // mean trend of cryptoOHlC on the sliding window. Instance of CryptoOHLC containing mean values
  this.meanCryptoValues = 0;
  // progression, in percent, of the crypto value since first value in the window
  this.percentageProgressionOnWindow = 0;
  // min value on window
  this.minValueOnWindow = 0;
  //max value on window
  this.maxValueOnWindow = 0;
  // max amplitude in % present in window to quickly detect big changes
  this.maxAmplitudeOnWindow = 0;
  // mean candle size in percent
  this.meanCandleSizeInPercent = 0;
  // standard deviation around mean candle size
  this.stdDevCandleSizePercent = 0;
  // crypto name
  this.cryptoName = cryptoName;
  // how many positive candles in second half of window
  this.numberPositiveSecondHalf;
  // number of negative in the last five should not be bigger than 2
  this.numberNegativeLastFive;
  // get time of last inserted cryptoOHLC
  this.timeLastOHLC;

};
// **********************************************************************************




/** *********************************************************************************
 *  Helper;
 * @param {any} cryptoOhlc
 * @returns
 ** *********************************************************************************/
function addCryptoOHLC(cryptoOhlc) {
  // first check if this element has not already been added
  if (this.hasAlreadyBeenAdded(cryptoOhlc)) {
    return null;
  }

  // removing first element if max window size is reached
  if (this.cryptoValues.length == SIZE) {
    const oldestOHLC = this.cryptoValues.shift();

    if (oldestOHLC && oldestOHLC.closeMinusOpen >= 0) {
      this.previousPositivesOrZero--;
    } else {
      this.previousNegatives--;
    }
  }

  // update positive and negative count on window
  if (cryptoOhlc.closeMinusOpen >= 0) {
    this.previousPositivesOrZero++;
  } else {
    this.previousNegatives++;
  }

  // calculate various fields
  this.cryptoValues.push(cryptoOhlc);
  this.meanCryptoValues = calculateMeanValue(this);
  this.percentageProgressionOnWindow = calculatePercentageProgressionOnWindow(this);
  this.minValueOnWindow = calculateMinValueOnWindow(this);
  this.maxValueOnWindow = calculateMaxValueOnWindow(this);
  this.maxAmplitudeOnWindow = calculateMaxAmplitudeOnWindow(this);
  this.meanCandleSizeInPercent = calculateMeanCandleSizePercent(this);
  this.stdDevCandleSizePercent = calculateStdDevCandleSizePercent(this);
  this.numberPositiveSecondHalf = calculateNumberPositiveSecondHalf(this);
  this.numberNegativeLastFive = calculateNumberNegativeLastFive(this);
  this.calculateTimeLastOHLC();

  this.toString();

  return cryptoOhlc;
}
SlidingWindow.prototype.addCryptoOHLC = addCryptoOHLC;
// **********************************************************************************




/** *********************************************************************************
 *  @returns the time of the last ohlc in the sliding window
 *
 ** *********************************************************************************/
SlidingWindow.prototype.getTime = function getTime() {
  if (this.cryptoValues.length === 0) {
    return null;
  }
  return this.getLast().date;
}
// **********************************************************************************




/** *********************************************************************************
 *  @returns the last ohlc in the sliding window
 *
 ** *********************************************************************************/
SlidingWindow.prototype.getLast = function getLast() {
  if (this.cryptoValues.length === 0) {
    return null;
  }
  return this.cryptoValues[this.cryptoValues.length - 1];
}
// **********************************************************************************



/** *********************************************************************************
 *  hasAlreadyBeenAdded
 *
 ** *********************************************************************************/
SlidingWindow.prototype.hasAlreadyBeenAdded = function hasAlreadyBeenAdded(cryptoOhlc) {
  return this.cryptoValues.find(elem => elem.time === cryptoOhlc.time) !== undefined;
}
// **********************************************************************************




/** *********************************************************************************
 *  hasAlreadyBeenAdded
 *
 ** *********************************************************************************/
SlidingWindow.prototype.calculateTimeLastOHLC = function calculateTimeLastOHLC() {
  this.timeLastOHLC = this.cryptoValues[this.cryptoValues.length - 1].time;
  return this.timeLastOHLC;
}
// **********************************************************************************

SlidingWindow.prototype.toString = function toString() {
  console.log('');
  console.log('######### Sliding Window', this.cryptoName, ' @', this.getTime());
  console.log('------');
  this.cryptoValues.forEach((elem, index) => {
    console.log('#',
      index,
      '[Open :',
      elem.open,
      '] [Close :',
      elem.close,
      '] [Candle Size :',
      math.round(elem.closeMinusOpen),
      ']');
  });
  console.log('------');
  console.log('pos :', this.previousPositivesOrZero);
  console.log('pos2eH :', this.numberPositiveSecondHalf);
  console.log('#########');
  console.log('');
}


/** *********************************************************************************
 *  Helper;
 *
 ** *********************************************************************************/
const calculateMeanValue = function calculateMeanValue(slidingWindow) {
  // if (slidingWindow.cryptoValues.length === 1) {
  //   return slidingWindow.cryptoValues[0].close;
  // }
  return slidingWindow.cryptoValues.reduce((acc, cur) => acc + (cur.close / slidingWindow.cryptoValues.length), 0);
}
// **********************************************************************************




/** *********************************************************************************
 *  Helper;
 *
 ** *********************************************************************************/
const calculatePercentageProgressionOnWindow = function calculatePercentageProgressionOnWindow(slidingWindow) {
  const firstC = slidingWindow.cryptoValues[0].open;
  const lastC = slidingWindow.cryptoValues[slidingWindow.cryptoValues.length - 1].close;
  return (lastC - firstC) / firstC * 100;
}
// **********************************************************************************




/** *********************************************************************************
 *  Helper;
 *
 ** *********************************************************************************/
const calculateMinValueOnWindow = function calculateMinValueOnWindow(slidingWindow) {
  return slidingWindow.cryptoValues.reduce((acc, cur) => Math.min(acc, cur.low), slidingWindow.cryptoValues[0].close)
}
// **********************************************************************************




/** *********************************************************************************
 *  Helper;
 *
 ** *********************************************************************************/
const calculateMaxValueOnWindow = function calculateMaxValueOnWindow(slidingWindow) {
  return slidingWindow.cryptoValues.reduce((acc, cur) => Math.max(acc, cur.low), slidingWindow.cryptoValues[0].close)
}
// **********************************************************************************




/** *********************************************************************************
 *  Helper;
 *
 ** *********************************************************************************/
const calculateMaxAmplitudeOnWindow = function calculateMaxAmplitudeOnWindow(slidingWindow) {
  return (slidingWindow.maxValueOnWindow - slidingWindow.minValueOnWindow) / slidingWindow.minValueOnWindow * 100;
}
// **********************************************************************************




/** *********************************************************************************
 *  Helper;
 *
 ** *********************************************************************************/
const calculateMeanCandleSizeAbsolute = function calculateMeanCandleSizeAbsolute(slidingWindow) {
  return slidingWindow.cryptoValues.reduce((acc, cur) => acc + (Math.abs(cur.closeMinusOpen) / slidingWindow.cryptoValues.length), 0);
}
// **********************************************************************************




/** *********************************************************************************
 *  Helper;
 *
 ** *********************************************************************************/
const calculateMeanCandleSizePercent = function calculateMeanCandleSizePercent(slidingWindow) {
  const meanSizeAbs = calculateMeanCandleSizeAbsolute(slidingWindow);
  return meanSizeAbs / slidingWindow.meanCryptoValues * 100;
}
// **********************************************************************************



/** *********************************************************************************
 *  Helper;
 *
 ** *********************************************************************************/
const calculateStdDevCandleSizePercent = function calculateStdDevCandleSizePercent(slidingWindow) {
  const meanSizeAbs = calculateMeanCandleSizeAbsolute(slidingWindow);
  const squaredDiffs = slidingWindow.cryptoValues.map((cryptoValue) =>
    Math.pow((cryptoValue.closeMinusOpen - meanSizeAbs), 2));
  const variance = squaredDiffs.reduce((acc, cur) => acc + cur / slidingWindow.cryptoValues.length);
  const stdDevAbs = Math.sqrt(variance);
  return stdDevAbs / slidingWindow.meanCryptoValues * 100;
}
// **********************************************************************************




/** *********************************************************************************
 *  Helper;
 *
 ** *********************************************************************************/
const calculateNumberPositiveSecondHalf = function calculateNumberPositiveSecondHalf(slidingWindow) {
  const windowLength = slidingWindow.cryptoValues.length;
  const values = slidingWindow.cryptoValues;
  let numberPositive = 0;
  for (let y = windowLength - 1; y > windowLength / 2; y--) {
    if (values[y].closeMinusOpen > 0) {
      numberPositive++;
    }
  }
  return numberPositive;
}
// **********************************************************************************




/** *********************************************************************************
 *  Helper;
 *
 ** *********************************************************************************/
const calculateNumberNegativeLastFive = function calculateNumberNegativeLastFive(slidingWindow) {
  const windowLength = slidingWindow.cryptoValues.length;
  const values = slidingWindow.cryptoValues;
  let numberNegative = 0;
  let count = 0;

  for (let y = windowLength - 1; y >= 0; y--) {
    count++;
    if (values[y].closeMinusOpen < 0) {
      numberNegative++;
    }
    if (count >= 4) { //exit the loop in a dirty way
      y = -1;
    }
  }
  return numberNegative;
}
// **********************************************************************************



module.exports = SlidingWindow;
