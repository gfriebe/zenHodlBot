const Telegraf = require('telegraf');
const commandParts = require('telegraf-command-parts');

const app = new Telegraf(process.env.BOT_TOKEN);
app.use(commandParts());

let cryptoMod = require("./cryptoMod");
let redis = require("./redis");

app.command('rate', ctx => {
	var coin = ctx.state.command.splitArgs[0];
	cryptoMod.currentRate(coin, function(response){
		return ctx.reply( response ); 
	})
});

app.command('set', ctx => {				
	var args = ctx.state.command.splitArgs;
	
	if(!args[1]) {
		return ctx.reply( 'Please provide key and value' ); 	
	}

	redis.store(ctx.from.id, args[0], args[1], function(response){
		return ctx.reply( response ); 		
	})		
	
});



app.startPolling();
