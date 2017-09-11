var sleep = require('system-sleep');
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
const clone = require('clone');
const path = require('path');
const readline = require('readline');

const bchOhlc = require('./training-data/BCHEUR.json');
const bchOhlc6 = require('./training-data/BCH_6_9_17.json');
const ethOhlc = require('./training-data/ETHEUR_6_9_17.json');
const ltcOhlc = require('./training-data/LTCEUR_5_9_17.json');
const ltcOhlc6 = require('./training-data/LTCEUR_6_9_17.json');
const ltcOhlc15m = require('./training-data/LTCEUR15min.json');
const eth5m = require('./training-data/ETH5min.json');
const xmr7 = require('./training-data/XMREUR_7_9_17.json');
const xmr5m = require('./training-data/XMREUR5min.json');
const xmr8 = require('./training-data/XMR_8_9.json');
const eth8 = require('./training-data/XETHZEUR_08-09-2017-22-46.json');

const math = require('./utils/math');
const { notify, setUseNotification } = require('./utils/notifier');
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
const cryptoWatcherxmr8 = cryptoWatcherFactory.create('xmr8');
const cryptoWatchereth8 = cryptoWatcherFactory.create('eth8');

cryptoWatcherBCH.slidingWindow.toStringMethod = 'none';
cryptoWatcherBCH6.slidingWindow.toStringMethod = 'none';
cryptoWatcherETH.slidingWindow.toStringMethod = 'none';
cryptoWatcherLTC.slidingWindow.toStringMethod = 'none';
cryptoWatcherLTC6.slidingWindow.toStringMethod = 'none';
cryptoWatcherLTC15m.slidingWindow.toStringMethod = 'none';
cryptoWatcherETH5m.slidingWindow.toStringMethod = 'none';
cryptoWatcherXMR7.slidingWindow.toStringMethod = 'none';
cryptoWatcherXMR5m.slidingWindow.toStringMethod = 'none';
cryptoWatcherxmr8.slidingWindow.toStringMethod = 'none';
cryptoWatchereth8.slidingWindow.toStringMethod = 'none';

const bchOhlcC = clone(bchOhlc);
const bchOhlc6C = clone(bchOhlc6);
const ethOhlcC = clone(ethOhlc);
const ltcOhlcC = clone(ltcOhlc);
const ltcOhlc6C = clone(ltcOhlc6);
const ltcOhlc15mC = clone(ltcOhlc15m);
const eth5mC = clone(eth5m);
const xmr7C = clone(xmr7);
const xmr5mC = clone(xmr5m);
const xmr8C = clone(xmr8);
const eth8C = clone(eth8);

setUseNotification(false);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

let answer = null;

// while (answer !== 'exit') {
rl.question('Which testset to launch ?', (res) => {


    answer = clone(res);
    rl.close();

    for (let y = 0; y < bchOhlcC.length; y++) {
        try {
            switch (answer) {
                case '1':
                    const cryptoOhlc1 = cryptoOHLCFactory.create(bchOhlcC[y]); // NEG - 0.26 / 0
                    cryptoWatcherBCH.add(cryptoOhlc1);
                    break;
                case '2':
                    const cryptoOhlc2 = cryptoOHLCFactory.create(bchOhlc6C[y]); // / POS 5.98
                    cryptoWatcherBCH6.add(cryptoOhlc2);
                    break;

                case '3':
                    const cryptoOhlc3 = cryptoOHLCFactory.create(ethOhlcC[y]); // NEG -0.08 / POS 1.73
                    cryptoWatcherETH.add(cryptoOhlc3);
                    break;
                case '4':
                    const cryptoOhlc4 = cryptoOHLCFactory.create(ltcOhlcC[y]); // NEG 1.5 / POS 7.58
                    cryptoWatcherLTC.add(cryptoOhlc4);
                    break;
                case '5':
                    const cryptoOhlc5 = cryptoOHLCFactory.create(ltcOhlc6C[y]); // NEG -3.25 / POS 1.39
                    cryptoWatcherLTC6.add(cryptoOhlc5);
                    break;
                case '6':
                    const cryptoOhlc6 = cryptoOHLCFactory.create(ltcOhlc15mC[y]); // POS 10 / POS 6.29
                    cryptoWatcherLTC15m.add(cryptoOhlc6);
                    break;
                case '7':
                    const cryptoOhlc7 = cryptoOHLCFactory.create(eth5mC[y]); // NEG -5.66 / POS 4.76
                    cryptoWatcherETH5m.add(cryptoOhlc7);
                    break;
                case '8':
                    const cryptoOhlc8 = cryptoOHLCFactory.create(xmr7C[y]); //NEG -0.26 / POS 0.1
                    cryptoWatcherXMR7.add(cryptoOhlc8);
                    break;
                case '9':
                    const cryptoOhlc9 = cryptoOHLCFactory.create(xmr5mC[y]); // NEG -2.28 / POS 8.25
                    cryptoWatcherXMR5m.add(cryptoOhlc9);
                    break;
                case '10':
                    const cryptoOhlc10 = cryptoOHLCFactory.create(xmr8C[y]); // POS 4.03% / POS 4.27
                    cryptoWatcherxmr8.add(cryptoOhlc10);
                    break;
                case '11':
                    const cryptoOhlc11 = cryptoOHLCFactory.create(eth8C[y]); // 0
                    cryptoWatchereth8.add(cryptoOhlc11);
                    break;
            }

            // sleep(SLEEP_BETWEEN_DATA);
        } catch (err) {
            console.log('err', err);
        }

    }

})

// }