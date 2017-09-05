// we will keep a sliding window of size SIZE. This is the size of the array
const SIZE = 10;

/** *********************************************************************************
 *  Helper;
 *
 ** *********************************************************************************/
const SlidingWindow = function SlidingWindow() {
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

    if (oldestOHLC.closeMinusOpen > 0) {
      this.previousPositivesOrZero--;
    } else {
      this.previousNegatives--;
    }
  }

  if (cryptoOhlc.closeMinusOpen > 0) {
    this.previousPositivesOrZero++;
  } else {
    this.previousNegatives++;
  }

  this.cryptoValues.push(cryptoOhlc);
  this.meanCryptoValues = calculateMeanValue(this);

  // we compute percentage from open of first to close of last
  this.percentageProgressionOnWindow = calculatePercentageProgressionOnWindow(this);

  this.minValueOnWindow = calculateMinValueOnWindow(this);
  this.maxValueOnWindow = calculateMaxValueOnWindow(this);
  this.maxAmplitudeOnWindow = calculateMaxAmplitudeOnWindow(this);

  return cryptoOhlc;
}
SlidingWindow.prototype.addCryptoOHLC = addCryptoOHLC;
// **********************************************************************************




/** *********************************************************************************
 *  @returns the time of the last ohlc in the sliding window
 *
 ** *********************************************************************************/
function getTime() {
  return  this.getLast().date;
}
SlidingWindow.prototype.getTime = getTime;
// **********************************************************************************




/** *********************************************************************************
 *  @returns the last ohlc in the sliding window
 *
 ** *********************************************************************************/
SlidingWindow.prototype.getLast = function getLast() {
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

module.exports = SlidingWindow;
