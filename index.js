const sleep = require('system-sleep');

const { setUseNotification } = require('./utils/notifier');
const cryptoWatcherFactory = require('./factories/cryptoWatcherFactory');
const cryptoOHLCFactory = require('./factories/cryptoOHLCFactory');

const { getOHLC, getTimeServer } = require('./cryptoParser');

const cryptoWatcherLTC = cryptoWatcherFactory.create('LiteCoin');
const cryptoWatcherBTC = cryptoWatcherFactory.create('Bitcoin');
const cryptoWatcherETH = cryptoWatcherFactory.create('Ethereum');
const cryptoWatcherXMR = cryptoWatcherFactory.create('Monero');
const cryptoWatcherBCH = cryptoWatcherFactory.create('Bitcoin Cash');
const cryptoWatcherXRP = cryptoWatcherFactory.create('Ripple');

cryptoWatcherLTC.slidingWindow.toStringMethod = 'light';
cryptoWatcherBTC.slidingWindow.toStringMethod = 'light';
cryptoWatcherETH.slidingWindow.toStringMethod = 'light';
cryptoWatcherXMR.slidingWindow.toStringMethod = 'light';
cryptoWatcherBCH.slidingWindow.toStringMethod = 'light';
cryptoWatcherXRP.slidingWindow.toStringMethod = 'light';

setUseNotification(true);

while (true) {
  try {
    const time = getTimeServer();

    // LTC
    const ohlcltc = getOHLC('XLTCZEUR', 1, time);
    const cryptoOhlcltc = cryptoOHLCFactory.create(ohlcltc[ohlcltc.length - 1]);
    cryptoWatcherLTC.add(cryptoOhlcltc);

    // BTC
    const ohlcxbt = getOHLC('XXBTZEUR', 1, time);
    const cryptoOhlcxbt = cryptoOHLCFactory.create(ohlcxbt[ohlcxbt.length - 1]);
    cryptoWatcherBTC.add(cryptoOhlcxbt);

    // ETH
    const ohlceth = getOHLC('XETHZEUR', 1, time);
    const cryptoOhlceth = cryptoOHLCFactory.create(ohlceth[ohlceth.length - 1]);
    cryptoWatcherETH.add(cryptoOhlceth);

    // XMR
    const ohlcxmr = getOHLC('XXMRZEUR', 1, time);
    const cryptoOhlcxmr = cryptoOHLCFactory.create(ohlcxmr[ohlcxmr.length - 1]);
    cryptoWatcherXMR.add(cryptoOhlcxmr);

    // BCH
    const ohlcbch = getOHLC('BCHEUR', 1, time);
    const cryptoOhlcbch = cryptoOHLCFactory.create(ohlcbch[ohlcbch.length - 1]);
    cryptoWatcherBCH.add(cryptoOhlcbch);

    // XRP
    const ohlcxrp = getOHLC('XXRPZEUR', 1, time);
    const cryptoOhlcxrp = cryptoOHLCFactory.create(ohlcxrp[ohlcxrp.length - 1]);
    cryptoWatcherXRP.add(cryptoOhlcxrp);
  } catch (err) {
    console.log('#########oops ', err);
  }

  sleep(30000);
}
