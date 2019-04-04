var CoinMarketCap = require("node-coinmarketcap");
var coinmarketcap = new CoinMarketCap();

exports.currentRate = function (coin = 'BTC') {
  var resp;
  coinmarketcap.multi(coins => {
  	resp = coins.get('BTC').price_usd; 
  });
  return resp;
};