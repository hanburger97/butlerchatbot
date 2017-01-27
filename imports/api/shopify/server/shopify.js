import shopifyAPI from 'shopify-node-api'


var Shopify = new shopifyAPI({
  shop: 'ConciergeAlbert', // MYSHOP.myshopify.com
  shopify_api_key: '826b1a9ca84e1575734c9cfe28edc5ba', // Your API key
  access_token: '12b97decc2caf438a340d5748e43a768'
});

export default Shopify
