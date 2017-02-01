import shopifyNodeAPI from 'shopify-node-api'

export const ShopifyApi = new shopifyNodeAPI({
  shop: Meteor.settings.public.shopify.store_name, // MYSHOP.myshopify.com
  shopify_api_key: Meteor.settings.private.shopify.api_key, // Your API key
  access_token:  Meteor.settings.private.shopify.access_token
});


/** Client Side API. Was made for front-end, but we can still use it on the server to poll and push infos not available on the server side */
import ShopifyBuy from 'shopify-buy'

export const ShopifyClient = ShopifyBuy.buildClient({
  apiKey: Meteor.settings.public.shopify.api_key,
  appId: 6,
  domain: `${Meteor.settings.public.shopify.store_name}.myshopify.com`
})
