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
const xmr7 = require('./training-data/XMREUR_7_9_17.json');
const xmr5m = require('./training-data/XMREUR5min.json');

const math = require('./utils/math');
const { notify } = require('./utils/notifier');
const cryptoWatcherFactory = require('./factories/cryptoWatcherFactory');
const cryptoOHLCFactory = require('./factories/cryptoOHLCFactory');

const { getOHLC, getTimeServer } = require('./cryptoParser');


const cryptoWatcherLTC = cryptoWatcherFactory.create('LiteCoin');
const cryptoWatcherBTC = cryptoWatcherFactory.create('Bitcoin');
const cryptoWatcherETH = cryptoWatcherFactory.create('Ethereum');
const cryptoWatcherXMR = cryptoWatcherFactory.create('Monero');
const cryptoWatcherBCH = cryptoWatcherFactory.create('Bitcoin Cash');
const cryptoWatcherXRP = cryptoWatcherFactory.create('Ripple');

cryptoWatcherLTC.slidingWindow.toStringMethod = 'none';
cryptoWatcherBTC.slidingWindow.toStringMethod = 'none';
cryptoWatcherETH.slidingWindow.toStringMethod = 'none';
cryptoWatcherXMR.slidingWindow.toStringMethod = 'none';
cryptoWatcherBCH.slidingWindow.toStringMethod = 'none';
cryptoWatcherXRP.slidingWindow.toStringMethod = 'none';

while (true) {
  try {
    const time = getTimeServer();

    // LTC
    const ohlcltc = getOHLC('XLTCZEUR', 1, time);
    const cryptoOhlcltc = cryptoOHLCFactory.create(ohlcltc[ohlcltc.length - 1]);
    cryptoWatcherLTC.add(cryptoOhlcltc);

    //BTC
    const ohlcxbt = getOHLC('XXBTZEUR', 1, time);
    const cryptoOhlcxbt = cryptoOHLCFactory.create(ohlcxbt[ohlcxbt.length - 1]);
    cryptoWatcherBTC.add(cryptoOhlcxbt);

    //ETH
    const ohlceth = getOHLC('XETHZEUR', 1, time);
    const cryptoOhlceth = cryptoOHLCFactory.create(ohlceth[ohlceth.length - 1]);
    cryptoWatcherETH.add(cryptoOhlceth);

    //XMR
    const ohlcxmr = getOHLC('XXMRZEUR', 1, time);
    const cryptoOhlcxmr = cryptoOHLCFactory.create(ohlcxmr[ohlcxmr.length - 1]);
    cryptoWatcherXMR.add(cryptoOhlcxmr);

    //BCH
    const ohlcbch = getOHLC('BCHEUR', 1, time);
    const cryptoOhlcbch = cryptoOHLCFactory.create(ohlcbch[ohlcbch.length - 1]);
    cryptoWatcherBCH.add(cryptoOhlcbch);

    //XRP
    const ohlcxrp = getOHLC('XXRPZEUR', 1, time);
    const cryptoOhlcxrp = cryptoOHLCFactory.create(ohlcxrp[ohlcxrp.length - 1]);
    cryptoWatcherXRP.add(cryptoOhlcxrp);
  } catch (err) {
    console.log('#########oops ', err);
  }

  sleep(30000);
}