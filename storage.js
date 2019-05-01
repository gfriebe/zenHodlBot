const asyncRedis = require("async-redis")
const client = asyncRedis.createClient()

const crypto = require("./crypto");

const userListKey = 'user_list'
const allCoinsKey = 'all_coins'

exports.add_price = async function (user_id, coin, price) {
    client.sadd(userListKey, user_id);
    coin = coin.toLowerCase();
    price = parseFloat(price);
    
    client.sadd(_coins_key(user_id), coin)
    await client.sadd(_coin_key(user_id, coin), price)
    
    return(await _get_coin(user_id, coin));
    
}

exports.remove_coin = async function(user_id, coin, cback) {
    coin = coin.toLowerCase();
    _remove_coin(user_id, coin);
    
    return('OK');
}

exports.remove_price = async function(user_id, coin, price) {
    coin = coin.toLowerCase();
    price = parseFloat(price);

    await client.srem(_coin_key(user_id, coin), price);

    let amount = await client.scard(_coin_key(user_id, coin))
    
    if(amount == 0) {
        _remove_coin(user_id, coin);
    }

    return(await _get_coin(user_id, coin));
}

exports.list = async function(user_id) {
    let _list = {};
    let _coins = await _get_coins(user_id);

    for (let _coin of _coins) {
        _list[_coin] = await _get_coin(user_id, _coin)
    }
    
    return(_list);
} 

exports.all_users = async function() {
    return await client.smembers(userListKey)
}

exports.all_coins = async function(){
    await _updateCoinData()
    return await client.smembers(allCoinsKey)
}

exports.getRateFor = async (coin) => {
    await _updateCoinData()
    const coin_data = await client.hgetall('coin_' + coin.toLowerCase())

    if(coin_data != undefined) {
        return(coin_data['price_usd'])
    }else{
        return undefined
    }
}


_updateCoinData = async () => {
    let all_coins = await client.smembers(allCoinsKey)

    if(all_coins.length == 0) {
        const coins =  await crypto.getRates()
        for(let coin of coins){
            client.sadd(allCoinsKey, coin['symbol'].toLowerCase())
            client.hmset('coin_' + coin['symbol'].toLowerCase(), coin)
        }
        client.expire(allCoinsKey, 600)
    }
}

_remove_coin = function(user_id, coin) {
    client.srem(_coins_key(user_id), coin)
    client.del(_coin_key(user_id, coin))
}

_get_coin = async function(user_id, coin) {
    response = await client.smembers(coin + '_' + user_id);
    ordered = response.sort(function(a, b){return parseFloat(a)-parseFloat(b)});
    return(ordered);
}

_get_coins = async function(user_id) {
    response = await client.smembers(_coins_key(user_id));
    return(response.sort());
}

_coin_key = function(user_id, coin) {
    return(coin + '_' + user_id);
}

_coins_key = function(user_id) {
    return('coins_' + user_id);
}

client.on('connect', function() {
    //console.log('Redis client connected');
})

client.on('error', function (err) {
    console.log('Something went wrong ' + err);
})