const Telegraf = require('telegraf');
const commandParts = require('telegraf-command-parts');
const app = new Telegraf(process.env.BOT_TOKEN);
app.use(commandParts());

let cryptoMod = require("./cryptoMod");

app.command('rate', ctx => {
	var coin = ctx.state.command.splitArgs[0];
	cryptoMod.currentRate(coin, function(response){
		return ctx.reply( response ); 
	})
});

app.startPolling();
