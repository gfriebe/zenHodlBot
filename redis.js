const asyncRedis = require("async-redis");
const client = asyncRedis.createClient();

client.on('connect', function() {
    console.log('Redis client connected');
});

client.on('error', function (err) {
    console.log('Something went wrong ' + err);
});

exports.add_price = async function (user_id, coin, price, cback) {     
    coin = coin.toLowerCase();
    price = parseInt(price);
    
    client.sadd(_coins_key(user_id), coin)
    await client.sadd(_coin_key(user_id, coin), price)
    
    cback(await _get_coin(user_id, coin));
    
};

exports.remove_coin = async function(user_id, coin, cback) {
    coin = coin.toLowerCase();
    _remove_coin(user_id, coin);
    
    cback('OK');
}

exports.remove_price = async function(user_id, coin, price, cback) {
    coin = coin.toLowerCase();
    price = parseInt(price);

    await client.srem(_coin_key(user_id, coin), price);

    amount = await client.scard(_coin_key(user_id, coin))
    
    if(amount == 0) {
        _remove_coin(user_id, coin);
    }

    cback(await _get_coin(user_id, coin));
}

exports.list = async function(user_id, cback) {
    let _list = {};
    _coins = await _get_coins(user_id);

    for (let _coin of _coins) {
        _list[_coin] = await _get_coin(user_id, _coin)
    }
    
    cback(_list);
} 


_remove_coin = function(user_id, coin) {
    client.srem(_coins_key(user_id), coin)
    client.del(_coin_key(user_id, coin))
}

_get_coin = async function(user_id, coin) {
    response = await client.smembers(coin + '_' + user_id);
    return(response.sort());
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