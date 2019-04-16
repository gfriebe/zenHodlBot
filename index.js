const Telegraf = require('telegraf');
const commandParts = require('telegraf-command-parts');

const app = new Telegraf(process.env.BOT_TOKEN);
app.use(commandParts());

let cryptoMod = require("./cryptoMod");
let redis = require("./redis");

app.command('start', ctx => {
	text =
	`Welcome to the zen way of hodling crypto!

	(This is in alpha and currently not fully functionl. No expectations for norhing.)

	If the following statements are true for you, you might like my services.
	You are holding crypto.
	You are interested in long term gains rather than short term trading.
	You don't intend to sell or buy based on short term volatility.
	You are checking the current value of your coins and portfolio several/many times a day, starting early morning.
	This takes up time and energy and based on the marekt direction it makes you excited or frustrated.

	If you are a long term hodler, checking crypto on a daily basis is a distraction from your real life, from what matters.
	It shouldn't have any influence on your emotional state and it shouldn't take up your time.

	Time is precious, let's not spend it on meaningless distractions.
	But still you want to know when something significant happens, something that might trigger an action from your part.

	Here is where I come in by enabling you to:
	- set price points on multi coins and I will send you a message once that price point is exceeded or fallen below
	- manually ask me about the state of your coins and I will tell you the broad ranges based on your price points

	From now on you will have the peace of mind of knowing you wont miss out on important changes while have in a general idea of the state of the market.
	
	So, set up your prices, remove all other direct crypto information channels from phone and laptop and live your life more meaningful and happy ever after.
	Type /help to get started!
	`
	return ctx.reply(text)
});

app.command('help', ctx => {
	var help = 
	`/start 				- Show the Welcome message
	/add coin price			- Adds an alert price for this coin (I will send an alert once the value exceeds or falls below this price)
	/remove coin [price] 	- Removes prices or a specific price (if given) for a coin
	/list					- Show all coins current broad values based on the prices you set
	/help					- Show help options
`
	return ctx.reply(help)
});

app.command('rate', ctx => {
	var coin = ctx.state.command.splitArgs[0];
	cryptoMod.currentRate(coin, function(response){
		return ctx.reply( response || 'there is no such coin'); 
	})
});

app.command('list', ctx => {	
	redis.list(ctx.from.id, function(response){
		return ctx.reply( response ); 
	})
});

app.command('add', ctx => {				
	var args = ctx.state.command.splitArgs;
	
	if(!args[1]) {
		return ctx.reply( 'Please provide coin and price' ); 	
	}

	cryptoMod.currentRate(args[0], function(response){
		if(response != undefined) {
			redis.add_price(ctx.from.id, args[0], args[1], function(response){
				return ctx.reply( response ); 		
			})		
		}else{
			return ctx.reply('there is no such coin'); 
		}
		
	})

});

app.command('remove', ctx => {				
	var args = ctx.state.command.splitArgs;
	
	if(!args[0]) {
		return ctx.reply( 'Please provide at least a coin' ); 	
	}else if(!args[1]) {
		redis.remove_coin(ctx.from.id, args[0], function(response){
			return ctx.reply( response ); 		
		})		
	}else {
		redis.remove_price(ctx.from.id, args[0], args[1], function(response){
			return ctx.reply( response ); 		
		})		
	}

});

app.startPolling();
