const _ = require('lodash');

const SIZE = 20;

/**
 * Sliding window model
 * @param {string} cryptoName
 */
function SlidingWindow(cryptoName) {
  this.cryptoValues = []; // array of SIZE last CryptoOHLC values
  this.previousPositivesOrZero = 0; // number of previous positive bars in the cryptoValues
  this.previousNegatives = 0; // number of previous negative bars in the cryptoValues
  // mean trend of cryptoOHlC on the sliding window. Instance of CryptoOHLC containing mean values
  this.meanCryptoValues = 0;
  this.percentageProgressionOnWindow = 0; // progression(%) of the crypto value since first value in the window
  this.minValueOnWindow = 0;
  this.maxValueOnWindow = 0;
  this.maxAmplitudeOnWindow = 0; // in %, for quick changes detection
  this.meanCandleSizeInPercent = 0;
  this.stdDevCandleSizePercent = 0; // standard deviation around mean candle size
  this.cryptoName = cryptoName;
  // this.numberPositiveSecondHalf; // how many positive candles in second half of window
  // this.numberNegativeLastFive; // number of negative in the last five
  // this.timeLastOHLC; // get time of last inserted cryptoOHLC
  // this.differenceMeanLowest;
  // this.authorizedDiffPosNeg;
  // this.minProgressionOnWindow;
  // this.minPositiveSecHalf;
  // this.maxNegativeLastFive;

  this.toStringMethod = 'none';
}

/**
 * Add a cryptoOHLC into the sliding window
 * @param {object} cryptoOhlc
 * @returns the new cryptoOHLC pushed or null if already inside the sliding window
 */
SlidingWindow.prototype.addCryptoOHLC = function addCryptoOHLC(cryptoOhlc) {
  if (this.hasAlreadyBeenAdded(cryptoOhlc)) {
    return null;
  }

  // removing first element if max window size is reached
  if (this.cryptoValues.length === SIZE) {
    const oldestOHLC = this.cryptoValues.shift();

    if (oldestOHLC && oldestOHLC.closeMinusOpen >= 0) {
      this.previousPositivesOrZero -= 1;
    } else {
      this.previousNegatives -= 1;
    }
  }

  // update positive and negative count on window
  if (cryptoOhlc.closeMinusOpen >= 0) {
    this.previousPositivesOrZero += 1;
  } else {
    this.previousNegatives += 1;
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
  this.calculateDifferenceMeanLowest();

  this.toString();

  return cryptoOhlc;
};

/**
 * Get the time of the last OHLC in the sliding window
 * @returns
 */
SlidingWindow.prototype.getTime = function getTime() {
  if (this.cryptoValues.length === 0) {
    return null;
  }
  return this.getLast().date;
};

/**
 * Get the last OHLC in the sliding window
 * @returns
 */
SlidingWindow.prototype.getLast = function getLast() {
  if (this.cryptoValues.length === 0) {
    return null;
  }
  return this.cryptoValues[this.cryptoValues.length - 1];
};

/**
 * Check if a cryptoOHLC is already inside the sliding window
 */
SlidingWindow.prototype.hasAlreadyBeenAdded = function hasAlreadyBeenAdded(cryptoOhlc) {
  if(!cryptoOhlc) {
    return true;
  }
  return this.cryptoValues.find(elem => elem.time === cryptoOhlc.time) !== undefined;
};

/**
 * Calculate the difference between mean and lowest and set the differenceMeanLowest
 */
SlidingWindow.prototype.calculateDifferenceMeanLowest = function calculateDifferenceMeanLowest() {
  this.differenceMeanLowest = (this.meanCryptoValues - this.minValueOnWindow) / (this.meanCryptoValues * 100);
};

/**
 * Get time of last OHLC
 */
SlidingWindow.prototype.calculateTimeLastOHLC = function calculateTimeLastOHLC() {
  this.timeLastOHLC = this.cryptoValues[this.cryptoValues.length - 1].time;
  return this.timeLastOHLC;
};

/**
 * To String function
 */
SlidingWindow.prototype.toString = function toString() {
  if (this.toStringMethod === 'full') {
    console.log('');
  }
  if (this.toStringMethod === 'full' || this.toStringMethod === 'light') {
    console.log('######### Sliding Window',
      this.cryptoName,
      ` @ ${this.getTime()} `,
      `[Mean : ${_.round(this.meanCryptoValues, 4)} ]`
    );
  }
  if (this.toStringMethod === 'full') {
    console.log('------');
    this.cryptoValues.forEach((elem, index) => {
      console.log(
        `# ${index} `,
        `[Open : ${elem.open} ] `,
        `[Close : ${elem.close} ] `,
        `[Candle Size : ${_.round(elem.closeMinusOpen, 5)} ]`
      );
    });
    console.log('------');
    console.log('Difference pos/neg :', this.previousPositivesOrZero - this.previousNegatives, ` → > ${this.authorizedDiffPosNeg}`);
    console.log('prog Window :', _.round(this.percentageProgressionOnWindow),
      `% → > ${this.minProgressionOnWindow}%`);
    console.log('pos2eH :', this.numberPositiveSecondHalf,
      `→ > ${this.minPositiveSecHalf}`);
    console.log('negLast5 :', this.numberNegativeLastFive,
      `→ < ${this.maxNegativeLastFive}`);
    console.log('#########');
    console.log('');
  }
};


/**
 * Calculate mean value of a sliding
 * @param {SlidingWindow} slidingWindow
 * @returns
 */
function calculateMeanValue(slidingWindow) {
  return slidingWindow.cryptoValues.reduce((acc, cur) => acc + (cur.close / slidingWindow.cryptoValues.length), 0);
}

/**
 * Calculate progression in % between first and last close value
 * @param {SlidingWindow} slidingWindow
 * @returns {Number}
 */
function calculatePercentageProgressionOnWindow(slidingWindow) {
  const meanFirst = Math.abs(slidingWindow.cryptoValues[0].close + slidingWindow.cryptoValues[0].open) / 2;
  const meanLast = Math.abs(slidingWindow.cryptoValues[slidingWindow.cryptoValues.length - 1].close + slidingWindow.cryptoValues[slidingWindow.cryptoValues.length - 1].close) / 2;
  return ((meanLast - meanFirst) / meanFirst) * 100;
}


/**
 * Calculate minimum value on sliding window
 * @param {SlidingWindow} slidingWindow
 * @returns {Number}
 */
function calculateMinValueOnWindow(slidingWindow) {
  return _.minBy(slidingWindow.cryptoValues, 'low');
}


/** *********************************************************************************
 *  Helper;
 *
 ** ******************************************************************************** */
const calculateMaxValueOnWindow = function calculateMaxValueOnWindow(slidingWindow) {
  return _.maxBy(slidingWindow.cryptoValues, 'high');
};


/** *********************************************************************************
 *  Helper;
 *
 ** ******************************************************************************** */
function calculateMaxAmplitudeOnWindow(slidingWindow) {
  return (slidingWindow.maxValueOnWindow - slidingWindow.minValueOnWindow) / (slidingWindow.minValueOnWindow * 100);
}


/** *********************************************************************************
 *  Helper;
 *
 ** ******************************************************************************** */
function calculateMeanCandleSizeAbsolute(slidingWindow) {
  return _.meanBy(slidingWindow.cryptoValues, 'closeMinusOpen');
}


/** *********************************************************************************
 *  Helper;
 *
 ** ******************************************************************************** */
function calculateMeanCandleSizePercent(slidingWindow) {
  const meanSizeAbs = calculateMeanCandleSizeAbsolute(slidingWindow);
  return (meanSizeAbs / slidingWindow.meanCryptoValues) * 100;
}
// **********************************************************************************


/** *********************************************************************************
 *  Helper;
 *
 ** ******************************************************************************** */
function calculateStdDevCandleSizePercent(slidingWindow) {
  const meanSizeAbs = calculateMeanCandleSizeAbsolute(slidingWindow);
  const squaredDiffs = slidingWindow.cryptoValues
    .map(cryptoValue => Math.pow(cryptoValue.closeMinusOpen - meanSizeAbs), 2);
  const variance = squaredDiffs.reduce((acc, cur) => acc + (cur / slidingWindow.cryptoValues.length));
  const stdDevAbs = Math.sqrt(variance);
  return (stdDevAbs / slidingWindow.meanCryptoValues) * 100;
}
// **********************************************************************************


/** *********************************************************************************
 *  count values that are strictly positive in second half of window
 *
 ** ******************************************************************************** */
function calculateNumberPositiveSecondHalf(slidingWindow) {
  const windowLength = slidingWindow.cryptoValues.length;
  const values = slidingWindow.cryptoValues;
  let numberPositive = 0;
  for (let y = windowLength - 1; y >= windowLength / 2; y--) {
    if (values[y].closeMinusOpen > 0) {
      numberPositive += 1;
    }
  }
  return numberPositive;
}
// **********************************************************************************


/** *********************************************************************************
 *  Helper;
 *
 ** ******************************************************************************** */
const calculateNumberNegativeLastFive = function calculateNumberNegativeLastFive(slidingWindow) {
  const windowLength = slidingWindow.cryptoValues.length;
  const values = slidingWindow.cryptoValues;
  let numberNegative = 0;
  let count = 0;

  for (let y = windowLength - 1; y >= 0; y--) {
    count += 1;
    if (values[y].closeMinusOpen < 0) {
      numberNegative += 1;
    }
    if (count > 4) { // exit the loop in a dirty way
      y = -1;
    }
  }
  return numberNegative;
};
// **********************************************************************************


module.exports = SlidingWindow;
