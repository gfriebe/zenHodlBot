const Telegraf = require('telegraf');
const app = new Telegraf(process.env.BOT_TOKEN);

var cryptoMod = require('./cryptoMod');

app.hears('hi', ctx => {  		
  return ctx.reply( cryptoMod.currentRate());  
});

app.startPolling();
