function round(number, precision = 2) {
    var pair = (number + 'e').split('e')
    var value = Math.round(pair[0] + 'e' + (+pair[1] + precision))
    pair = (value + 'e').split('e')
    return +(pair[0] + 'e' + (+pair[1] - precision))
}

/**
 *
 * @param {*} ohlc
 *
 * use the close value located a elem[4]
 *
 * @param {any} ohlc
 * @returns
 */
function getMin(ohlc) {
    let min = 1e10;
    let minElem = [];
    ohlc.forEach(elem => {
        if (elem.close < min) {
            min = elem.close;
            minElem = elem;
        }
    });
    return minElem;
}

function getMax(ohlc) {
    let max = 0;
    let maxElem = [];
    ohlc.forEach(elem => {
        if (elem.close > max) {
            max = elem.close;
            maxElem = elem;

        }
    });
    return maxElem;
}

module.exports = {
  round,
  getMin,
  getMax,
};