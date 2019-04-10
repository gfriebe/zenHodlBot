const asyncRedis = require("async-redis");
const client = asyncRedis.createClient();

const redis_prefix = 'Telegram-ID_'

client.on('connect', function() {
    console.log('Redis client connected');
});

client.on('error', function (err) {
    console.log('Something went wrong ' + err);
});

exports.get_user_data = async function (user_id, cback) {
    client.hgetall(redis_prefix + user_id).then(function (res) {        
        return res;
    });    
};

exports.store = async function (user_id, key, value, cback) {     
    user_data = await client.hgetall(redis_prefix + user_id)
    user_data = user_data || {}    
    user_data[key] = value;
    resp = await client.hmset(redis_prefix + user_id, user_data)
    
    if(resp == 'OK'){
        cback(user_data)
    }else{
        cback('failed');    
    }
    
};
