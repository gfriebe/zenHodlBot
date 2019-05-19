#!/usr/bin/env node
const _fs = require('fs');
const _token = _fs.readFileSync(__dirname + '/telegram.token', 'utf8');

const asyncRedis = require("async-redis")
const client = asyncRedis.createClient()

const Telegraf = require('telegraf');
const app = new Telegraf(_token);

let store = require("./storage");
const allCoinsKey = 'all_coins'

run = async function () {

  let alerts = 0

  let users = await store.all_users();

  for (let user of users) {
    let coins = await store.list(user);


    for (let coin in coins) {
      const rates = coins[coin];
      const current_rate = await store.getRateFor(coin)
      const compare_rate = await _getCompareRateFor(coin)

      if (current_rate != undefined && compare_rate != undefined && current_rate != compare_rate) {

        let mixed_rates = rates.concat([compare_rate, current_rate])

        mixed_rates = mixed_rates.sort(function (a, b) {
          return parseFloat(a) - parseFloat(b)
        });

        // there is no user value between the current rate and the compare rate
        if (Math.abs(mixed_rates.indexOf(current_rate) - mixed_rates.indexOf(compare_rate)) == 1) {
          continue;
        }

        let text

        if (parseFloat(current_rate) > parseFloat(compare_rate)) {
          text = ' is now above $ ' + mixed_rates[mixed_rates.indexOf(current_rate) - 1]
        } else {
          text = ' is now below $ ' + mixed_rates[mixed_rates.indexOf(current_rate) + 1]
        }

        alerts += 1;
        await app.telegram.sendMessage(user, coin + text);
      }
    }
  }

  await _storeCompareCoinData();

  const time = new Date()
  const human_time = `${time.getDate()}.${time.getMonth() + 1}.${time.getFullYear()} ${time.getHours()}:${time.getMinutes()}`
  console.log(`${human_time}: alerts send to ${alerts} users`)
  process.exit();
}


run();

// stores current coin data into compare keys
_storeCompareCoinData = async () => {
  let all_coins = await client.smembers(allCoinsKey)

  if (all_coins.length > 0) {
    for (let coin of all_coins) {
      const coin_data = await client.hgetall('coin_' + coin.toLowerCase())
      client.hmset('coin_compare_' + coin.toLowerCase(), coin_data)
    }
  }
}

_getCompareRateFor = async (coin) => {
  const coin_data = await client.hgetall('coin_compare_' + coin.toLowerCase())

  if (coin_data != undefined) {
    return (coin_data['price_usd'])
  } else {
    return undefined
  }
}