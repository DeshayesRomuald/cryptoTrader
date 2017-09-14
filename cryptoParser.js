const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
const moment = require('moment');
const fs = require('fs');

function httpGetSync(theUrl, callback) {
  const xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function () {
    if (xmlHttp.readyState === 4 && xmlHttp.status === 200) { callback(xmlHttp.responseText); }
  };
  xmlHttp.open('GET', theUrl, false); // true for asynchronous
  xmlHttp.send(null);
}

// const ETH = 'XETHZEUR';
// const ohlc = parseOHLC(ETH, 1, 1503933600);
// to push in json file use this
// writeToFile(ohlc, ETH);

/**
 *
 *
 * @param {string} [pair='BCHEUR']
 * @param {number} [timeIntervalInMin=1]
 * @param {any} [sinceValue=null]
 *
 * @return {array} [ohlcData] the ohlcdata structured as follows :
 *  ohlcData[0] time
 *  ohlcData[1] open
 *  ohlcData[2] high
 *  ohlcData[3] low
 *  ohlcData[4] close
 *  ohlcData[5] vwap
 *  ohlcData[6] volume
 *  ohlcData[7] count
 *  ohlcData[8] date
 */
function parseOHLC(pair = 'BCHEUR', timeIntervalInMin = 1, sinceValue = null) {
  const sinceBlock = (sinceValue && `&since=${sinceValue}`) || '';
  let request = 'https://api.kraken.com/0/public/OHLC?';
  request += `pair=${pair}&`;
  request += `interval=${timeIntervalInMin}`;
  request += `${sinceBlock}`;

  let processedValues = null;

  httpGetSync(request, (res) => {
    const rawValues = JSON.parse(res);

        // console.log('#########rawVal', JSON.stringify(rawValues, null, 2));
    const values = rawValues.result[pair];
    processedValues = values.map((element) => {
      element.push(new Date(element[0] * 1000).toLocaleTimeString());
      return element;
    });

        // console.log('#########processedValues', JSON.stringify(processedValues, null, 2));
    return processedValues;
  });

  return processedValues;
}

function writeToFile(array, cryptoName) {
  const arrayString = JSON.stringify(array, null, 2);
  const now = moment().format('DD-MM-YYYY-HH-mm');
  fs.writeFile(`./training-data/${cryptoName}_${now}.json`, arrayString, (err) => {
    if (err) {
      return console.log(err);
    }
    console.log('The file was saved!');
  });
}

function getTimeServer() {
  const request = 'https://api.kraken.com/0/public/Time';
  let unixTime = null;
  httpGetSync(request, (res) => {
    const rawTime = JSON.parse(res);
    unixTime = rawTime.result.unixtime;
  });
  return unixTime;
}


/**
 *
 *
 * @param {string} [pair='BCHEUR']
 * @param {number} [timeIntervalInMin=1]
 * @param {any} [sinceValue=null]
 *
 * @return {array} [ohlcData] the ohlcdata structured as follows :
 *  ohlcData[0] time
 *  ohlcData[1] open
 *  ohlcData[2] high
 *  ohlcData[3] low
 *  ohlcData[4] close
 *  ohlcData[5] vwap
 *  ohlcData[6] volume
 *  ohlcData[7] count
 *  ohlcData[8] date
 */
function getOHLC(pair = 'BCHEUR', timeIntervalInMin = 1, sinceValue = null) {
  const sinceBlock = (sinceValue && `&since=${sinceValue}`) || '';
  let request = 'https://api.kraken.com/0/public/OHLC?';
  request += `pair=${pair}&`;
  request += `interval=${timeIntervalInMin}`;
  request += `${sinceBlock}`;

  let processedValues = null;

  httpGetSync(request, (res) => {
    const rawValues = JSON.parse(res);

        // console.log('#########rawVal', JSON.stringify(rawValues, null, 2));
    const values = rawValues.result[pair];
    processedValues = values.map((element) => {
      element.push(new Date(element[0] * 1000).toLocaleTimeString());
      return element;
    });

        // console.log('#########processedValues', JSON.stringify(processedValues, null, 2));
    return processedValues;
  });

  return processedValues;
}


/**
 *
 *
 * @param {any} ohlcData table of ohlc data as returned
 */
function marketValueEvolution(ohlcData) {
  console.log('#########Number of values', JSON.stringify(ohlcData.length, null, 2));
  console.log('#########MIN', JSON.stringify(getMin(ohlcData), null, 2));
  console.log('#########MAX', JSON.stringify(getMax(ohlcData), null, 2));

  let sumBenefPercent = 0;

  for (let y = 1; y < ohlcData.length; y++) {
    const difference = ohlcData[y].close - ohlcData[y - 1].close;
    const percentage = difference / ohlcData[y - 1].close * 100;
        // console.log('#########time', ohlcData[y][8], ' @ ', ohlcData[y][4]);


    if (percentage > 0.9) {
            // console.log('#########DATE %', JSON.stringify(ohlcData[y][8], null, 2));
            // console.log('#########difference', JSON.stringify(difference, null, 2));
            // console.log('#########percentage', JSON.stringify(percentage, null, 2));


      y++;
      if (y >= ohlcData.length) {
        return;
      }
      const beginRate = ohlcData[y].close;
      const nextDifference = ohlcData[y].close - ohlcData[y - 1].close;
      const nextPercentage = nextDifference / ohlcData[y - 1].close * 100;
      if (nextPercentage > 0) {
        console.log('#########nextPercentage', JSON.stringify(nextPercentage, null, 2));
        console.log('#########BUY HERE', ohlcData[y].date, ' @ ', ohlcData[y].close);
                // console.log('#########percentage', JSON.stringify(nextPercentage, null, 2));

                // stop when difference is negative : 1st naive way
                // should check if difference is atleast 0.27%, otherwise we don't make money
                // better implementation, trailing stop, new high - x%, reevaluated
        let stop = false;
        y += 1;
        while (!stop && y < ohlcData.length) {
          const ffDiff = ohlcData[y].close - ohlcData[y - 1].close;
          const ffDiffPercentage = ffDiff / ohlcData[y - 1].close * 100;
          console.log('#########ffDiffPercentage', round(ffDiffPercentage, 4));
          const endRate = ohlcData[y].close;
          const benef = (endRate - beginRate);
          const benefPercent = benef / beginRate * 100;
          if (ffDiff < 0) {
            console.log('#########SELL HERE', ohlcData[y].date, '@ ', ohlcData[y].close);
            console.log('#########BENEF', round(benefPercent), '%');
            sumBenefPercent += benefPercent;
            stop = true;
          }
          if (y === ohlcData.length) { // at the end of the stream, not yet time to sell
            console.log('#########current benef', JSON.stringify(benefPercent, null, 2));
          }
          y++;
        } // end while
      } // end next % 1.5
    } // end % 1.2
  } // end for
  console.log('#########SUM BENEF %', JSON.stringify(sumBenefPercent, null, 2));
} // end fct


function getSpread(pair = 'BCHEUR') {
  let lastPair = [];
  httpGetSync(`https://api.kraken.com/0/public/Spread?pair=${pair}`, (res) => {
    const pairs = JSON.parse(res);

    lastPair = pairs.result[pair].find(elem => elem[0] === pairs.result.last);
    console.log('time :', new Date(lastPair[0] * 1000).toLocaleTimeString());
    console.log('bid :', lastPair[1]);
    console.log('ask :', lastPair[2]);

    const allPairs = pairs.result[pair];
  });
  console.log(`get pair ${pair} :`, lastPair[2]);
}

module.exports = {
  getOHLC,
  getTimeServer,
};
