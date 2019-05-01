#!/usr/bin/env node
const _fs = require('fs');
const _token = _fs.readFileSync(__dirname + '/telegram.token', 'utf8');

const Telegraf = require('telegraf');
const commandParts = require('telegraf-command-parts');

const app = new Telegraf(_token);
app.use(commandParts());

let store = require("./storage");

app.command('start', ctx => {
  const text =
    `Welcome to the zen way of hodling crypto!

	If the following statements are true for you, you might like my services.
	
	- You are holding crypto.
	- You are interested in long term gains rather than short term trading.
	- You don't intend to sell or buy based on short term volatility.
	- You are checking the current value of your coins and portfolio several/many times a day, starting early morning.
	- This takes up time and energy and based on the market direction it makes you excited or frustrated.

	If you are a long term hodler, checking crypto on a daily basis is a distraction from your real life, from what matters.
	It shouldn't have any influence on your emotional state and it shouldn't take up your time.

	Time is precious, let's not spend it on meaningless distractions.
	But still you want to know when something significant happens, something that might trigger an action from your part.

	Here is where I come in by enabling you to:
	- set price points on multiple coins and I will send you a message once that price point is exceeded or fallen below
	- manually ask me about the state of your coins and I will tell you the broad ranges based on your price points

	From now on you will have the peace of mind of knowing you won't miss out on important changes, while having a general idea of the state of the market.
	
	So, set up your prices, remove all other direct crypto information channels from phone and laptop and live your life more meaningful and happy ever after.
	Type /help to get started!
	`
  return ctx.reply(text)
});

app.command(['help','h'], ctx => {
  const help =
    `/start   > Show the welcome message
/add coin price   > Adds an alert price for this coin (I will send an alert once the value exceeds or falls below this price) e.g. /add eth 250
/remove coin [price] 	 > Removes coin or a specific price (if given)  e.g. /remove eth 250 or  e.g. /remove eth
/list   > Show all coins and its alert prices
/state   > current broad values for your coins
/help   > Show this help
    
You can also just use the first letter like /s for state.
`
  return ctx.reply(help)
});

app.command(['rate'], async ctx => {
  let coin = ctx.state.command.splitArgs[0];
  let resp = await store.getRateFor(coin)

  return ctx.reply(resp || 'there is no such coin');
});

app.command(['list','l'], async ctx => {
  const coins = await store.list(ctx.from.id);
  let msg = ''

  for (let coin in coins) {
    msg = msg + `${coin}: ${coins[coin].join(', ')}\n`
  }

  ctx.reply(msg);
});

app.command(['add','a'], async ctx => {
  let args = ctx.state.command.splitArgs;

  if (!args[1]) {
    return ctx.reply('Please provide coin and price');
  }

  let all_coins = await store.all_coins();

  if(all_coins.includes(args[0])) {
    let resp = await store.add_price(ctx.from.id, args[0], args[1])
    return ctx.reply(`${args[0]}: ${resp.join(', ')}`);

  } else {
    return ctx.reply('there is no such coin');
  }

});

app.command(['remove','r'], async ctx => {
  const args = ctx.state.command.splitArgs;

  if (!args[0]) {
    return ctx.reply('Please provide at least a coin name, like btc.');
  } else if (!args[1]) {
    store.remove_coin(ctx.from.id, args[0])
    return ctx.reply(`${args[0]} has no more price points`);

  } else {
    let resp = await store.remove_price(ctx.from.id, args[0], args[1])
    if(resp.length == 0){
      return ctx.reply(`${args[0]} has no more price points`);
    }else{
      return ctx.reply(`${args[0]}: ${resp.join(', ')}`);
    }
    
  }

});

app.command(['state', 's'], async ctx => {

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

    msg = msg + `\n${coin} ${_msg}`;
  }

  ctx.reply(msg);

});

app.startPolling();
