const axios = require("axios");
const url = "https://api.coinmarketcap.com/v1/ticker";

exports.getRates = async (convert = 'USD') => {
  const response = await axios.get(url + `?convert=${convert}`)
  return normalize(response.data)
}

// making sure we have no null values
normalize = (coin_array) => {
  for (const [i, coin] of coin_array.entries()) {
    for (const [key, value] of Object.entries(coin)) {
      coin_array[i][key] = value || ''
    }
  }

  return coin_array
}