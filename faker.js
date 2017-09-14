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
const cryptoWalletFactory = require('./factories/cryptoWalletFactory');
const cryptoCurrencyFactory = require('./factories/cryptoCurrencyFactory');
const { getOHLC, getTimeServer } = require('./cryptoParser');

const wallet = cryptoWalletFactory.create();

const cryptoWatchers = [
    cryptoWatcherFactory.create('Bitcoin cash', wallet),
    cryptoWatcherFactory.create('Bitcoin cash 6', wallet),
    cryptoWatcherFactory.create('Ethereum', wallet),
    cryptoWatcherFactory.create('Litecoin', wallet),
    cryptoWatcherFactory.create('LTC 6', wallet),
    cryptoWatcherFactory.create('LTC 15m', wallet),
    cryptoWatcherFactory.create('ETH5m', wallet),
    cryptoWatcherFactory.create('XMR7', wallet),
    cryptoWatcherFactory.create('XMR5m', wallet),
    cryptoWatcherFactory.create('xmr8', wallet),
    cryptoWatcherFactory.create('eth8', wallet),
];

wallet.addFiat(1000);
cryptoWatchers.forEach(watcher => {
    wallet.addCryptoCurrency(cryptoCurrencyFactory.createEmpty(watcher.slidingWindow.cryptoName))
})

const jsonFiles = [
    clone(bchOhlc),
    clone(bchOhlc6),
    clone(ethOhlc),
    clone(ltcOhlc),
    clone(ltcOhlc6),
    clone(ltcOhlc15m),
    clone(eth5m),
    clone(xmr7),
    clone(xmr5m),
    clone(xmr8),
    clone(eth8),
]

const cryptoOHLCs = [];

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

    for (let y = 0; y < jsonFiles[0].length; y++) {
        try {
            switch (answer) {
                case '1':
                    const cryptoOhlc1 = cryptoOHLCFactory.create(jsonFiles[0][y]); // NEG - 0.26 / 0
                    cryptoWatchers[0].add(cryptoOhlc1);
                    break;
                case '2':
                    const cryptoOhlc2 = cryptoOHLCFactory.create(jsonFiles[1][y]); // / POS 5.98
                    cryptoWatchers[1].add(cryptoOhlc2);
                    break;

                case '3':
                    const cryptoOhlc3 = cryptoOHLCFactory.create(jsonFiles[2][y]); // NEG -0.08 / POS 1.73
                    cryptoWatchers[2].add(cryptoOhlc3);
                    break;
                case '4':
                    const cryptoOhlc4 = cryptoOHLCFactory.create(jsonFiles[3][y]); // NEG 1.5 / POS 7.56
                    cryptoWatchers[3].add(cryptoOhlc4);
                    break;
                case '5':
                    const cryptoOhlc5 = cryptoOHLCFactory.create(jsonFiles[4][y]); // NEG -3.25 / POS 1.39
                    cryptoWatchers[4].add(cryptoOhlc5);
                    break;
                case '6':
                    const cryptoOhlc6 = cryptoOHLCFactory.create(jsonFiles[5][y]); // POS 10 / POS 6.29
                    cryptoWatchers[5].add(cryptoOhlc6);
                    break;
                case '7':
                    const cryptoOhlc7 = cryptoOHLCFactory.create(jsonFiles[6][y]); // NEG -5.66 / POS 4.76
                    cryptoWatchers[6].add(cryptoOhlc7);
                    break;
                case '8':
                    const cryptoOhlc8 = cryptoOHLCFactory.create(jsonFiles[7][y]); //NEG -0.26 / POS 0.1
                    cryptoWatchers[7].add(cryptoOhlc8);
                    break;
                case '9':
                    const cryptoOhlc9 = cryptoOHLCFactory.create(jsonFiles[8][y]); // NEG -2.28 / POS 8.25
                    cryptoWatchers[8].add(cryptoOhlc9);
                    break;
                case '10':
                    const cryptoOhlc10 = cryptoOHLCFactory.create(jsonFiles[9][y]); // POS 4.03% / POS 4.27
                    cryptoWatchers[9].add(cryptoOhlc10);
                    break;
                case '11':
                    const cryptoOhlc11 = cryptoOHLCFactory.create(jsonFiles[10][y]); // 0
                    cryptoWatchers[10].add(cryptoOhlc11);
                    break;
                default:
                    for (var i = 0; i < jsonFiles.length; i++) {
                        const cryptoOhlc11 = cryptoOHLCFactory.create(jsonFiles[i][y]); // 0
                        cryptoWatchers[i].add(cryptoOhlc11);
                    }
                    break;
            }
        } catch (err) {
            console.log('err', err);
        }

    } // END OUTER FOR LOOP

    let total = 0;
    for (var i = 0; i < cryptoWatchers.length; i++) {
        const totalSelli = cryptoWatchers[i].getTotalSell();
        total += totalSelli;
        console.log(`WATCHER `, totalSelli);
    }
    console.log('TOTAL = ', total);
    console.log(`Wallet balance ${wallet.getWalletValue()}`);


})

// }