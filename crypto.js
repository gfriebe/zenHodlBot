const axios = require("axios");
const url = "https://api.coinmarketcap.com/v1/ticker";

exports.getRates = async (convert = 'USD') => {
  const response = await axios.get(url + `?convert=${convert}`)
  return response.data

}