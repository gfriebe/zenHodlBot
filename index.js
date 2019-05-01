#!/usr/bin/env node
const _fs = require('fs');
const _token = _fs.readFileSync(__dirname + '/telegram.token', 'utf8');

const Telegraf = require('telegraf');
const commandParts = require('telegraf-command-parts');

const app = new Telegraf(_token);
app.use(commandParts());

let store = require("./storage");

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
	/remove coin [price] 	- Removes coin or a specific price (if given)
	/list					- Show all coins and its alert prices 
	/state        - current broad values for your coins					
	/help					- Show this help
`
  return ctx.reply(help)
});

app.command('rate', async ctx => {
  let coin = ctx.state.command.splitArgs[0];
  let resp = await store.getRateFor(coin)

  return ctx.reply(resp || 'there is no such coin');
});

app.command('list', async ctx => {
  resp = await store.list(ctx.from.id);
  ctx.reply(resp);
});

app.command('add', async ctx => {
  let args = ctx.state.command.splitArgs;

  if (!args[1]) {
    return ctx.reply('Please provide coin and price');
  }

  let all_coins = await store.all_coins();

  if(all_coins.includes(args[0])) {
    let resp = await store.add_price(ctx.from.id, args[0], args[1])
    return ctx.reply(resp);

  } else {
    return ctx.reply('there is no such coin');
  }

});

app.command('remove', async ctx => {
  var args = ctx.state.command.splitArgs;

  if (!args[0]) {
    return ctx.reply('Please provide at least a coin');
  } else if (!args[1]) {
    resp = await store.remove_coin(ctx.from.id, args[0])
    return ctx.reply(resp);

  } else {
    resp = await store.remove_price(ctx.from.id, args[0], args[1])
    return ctx.reply(resp);

  }

});

app.command('status', async ctx => {

  const coins = await store.list(ctx.from.id);
  let msg = ''

  for (let coin in coins) {
    const value = await store.getRateFor(coin);
    let mixed_rates = coins[coin].concat(value)

    mixed_rates = mixed_rates.sort(function (a, b) {
      return parseFloat(a) - parseFloat(b)
    });

    const value_index = mixed_rates.indexOf(value)
    let _msg = ''

    if(value_index == 0){
      _msg = 'is below' + mixed_rates[1]
    }else if(value_index == mixed_rates.length - 1){
      _msg = 'is above' + mixed_rates[mixed_rates.length - 2];
    }else{
      _msg = 'is between ' + mixed_rates[value_index - 1] + ' and ' + mixed_rates[value_index + 1]
    }

    msg = msg + `\n${coin}  ${_msg}`;
  }

  ctx.reply(msg);

});

app.startPolling();
