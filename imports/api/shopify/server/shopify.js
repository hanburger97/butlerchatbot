import shopifyNodeAPI from 'shopify-node-api'

export const ShopifyApi = new shopifyNodeAPI({
  shop: 'ConciergeAlbert', // MYSHOP.myshopify.com
  shopify_api_key: '826b1a9ca84e1575734c9cfe28edc5ba', // Your API key
  access_token: '12b97decc2caf438a340d5748e43a768'
});


/** Client Side API. Was made for front-end, but we can still use it on the server to poll and push infos not available on the server side */
import ShopifyBuy from 'shopify-buy'

export const ShopifyClient = ShopifyBuy.buildClient({
  apiKey: '23386c1b44d63dc361ff31db7f0978e3',
  appId: 6,
  domain: 'conciergealbert.myshopify.com'
})
