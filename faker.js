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

const SLEEP_BETWEEN_DATA = 0;


const cryptoWatcherBCH = cryptoWatcherFactory.create('Bitcoin cash');
const cryptoWatcherBCH6 = cryptoWatcherFactory.create('Bitcoin cash 6');
const cryptoWatcherETH = cryptoWatcherFactory.create('Ethereum');
const cryptoWatcherLTC = cryptoWatcherFactory.create('Litecoin');
const cryptoWatcherLTC6 = cryptoWatcherFactory.create('LTC 6');
const cryptoWatcherLTC15m = cryptoWatcherFactory.create('LTC 15m');
const cryptoWatcherETH5m = cryptoWatcherFactory.create('ETH5m');
const cryptoWatcherXMR7 = cryptoWatcherFactory.create('XMR7');
const cryptoWatcherXMR5m = cryptoWatcherFactory.create('XMR5m');

cryptoWatcherBCH.slidingWindow.toStringMethod = 'none';
cryptoWatcherBCH6.slidingWindow.toStringMethod = 'none';
cryptoWatcherETH.slidingWindow.toStringMethod = 'none';
cryptoWatcherLTC.slidingWindow.toStringMethod = 'none';
cryptoWatcherLTC6.slidingWindow.toStringMethod = 'none';
cryptoWatcherLTC15m.slidingWindow.toStringMethod = 'none';
cryptoWatcherETH5m.slidingWindow.toStringMethod = 'none';
cryptoWatcherXMR7.slidingWindow.toStringMethod = 'none';
cryptoWatcherXMR5m.slidingWindow.toStringMethod = 'none';

const bchOhlcC = clone(bchOhlc);
const bchOhlc6C = clone(bchOhlc6);
const ethOhlcC = clone(ethOhlc);
const ltcOhlcC = clone(ltcOhlc);
const ltcOhlc6C = clone(ltcOhlc6);
const ltcOhlc15mC = clone(ltcOhlc15m);
const eth5mC = clone(eth5m);
const xmr7C = clone(xmr7);
const xmr5mC = clone(xmr5m);

for (let y = 0; y < bchOhlcC.length; y++) {

    // const cryptoOhlc1 = cryptoOHLCFactory.create(bchOhlcC[y]);
    // cryptoWatcherBCH.add(cryptoOhlc1);

    // const cryptoOhlc2 = cryptoOHLCFactory.create(bchOhlc6C[y]);
    // cryptoWatcherBCH6.add(cryptoOhlc2);

    const cryptoOhlc3 = cryptoOHLCFactory.create(ethOhlcC[y]);
    cryptoWatcherETH.add(cryptoOhlc3);

    const cryptoOhlc4 = cryptoOHLCFactory.create(ltcOhlcC[y]);
    cryptoWatcherLTC.add(cryptoOhlc4);

    // const cryptoOhlc5 = cryptoOHLCFactory.create(ltcOhlc6C[y]);
    // cryptoWatcherLTC6.add(cryptoOhlc5);

    // const cryptoOhlc6 = cryptoOHLCFactory.create(ltcOhlc15mC[y]);
    // cryptoWatcherLTC15m.add(cryptoOhlc6);

    // const cryptoOhlc7 = cryptoOHLCFactory.create(eth5mC[y]);
    // cryptoWatcherETH5m.add(cryptoOhlc7);

    // const cryptoOhlc8 = cryptoOHLCFactory.create(xmr7C[y]);
    // cryptoWatcherXMR7.add(cryptoOhlc8);

    // const cryptoOhlc9 = cryptoOHLCFactory.create(xmr5mC[y]);
    // cryptoWatcherXMR5m.add(cryptoOhlc9);


    sleep(SLEEP_BETWEEN_DATA);

}
