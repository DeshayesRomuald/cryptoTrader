const CryptoWallet = require('../models/CryptoWallet');

function create() {
    const cryptoWallet = new CryptoWallet();

    cryptoWallet.balanceInEur = 0;
    cryptoWallet.cryptoCurrencies = [];

    return cryptoWallet;
}

module.exports = {
    create,
};
