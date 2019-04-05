var CoinMarketCap = require("node-coinmarketcap");
var coinmarketcap = new CoinMarketCap();

exports.currentRate =  function (coin = 'BTC', cback) {
      coinmarketcap.multi(async coins => {
      	cback(coins.get(coin).price_usd);
      });
};