var CoinMarketCap = require("node-coinmarketcap");
var coinmarketcap = new CoinMarketCap();

exports.currentRate =  function (coin = 'BTC', cback) {
      coinmarketcap.multi(async coins => {
            coin = coins.get(coin) 
            if(coin != undefined) {
                  cback(coins.get(coin).price_usd);
            }else{
                  cback(undefined);
            }
      	
      });
};