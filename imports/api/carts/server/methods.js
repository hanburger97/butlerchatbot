import {ShopifyClient} from '/imports/api/shopify/server/shopify'
import Cart from './Cart'

const cartsCache = {}

export const create = (query = {}) => {
  return ShopifyClient.createCart(query)
    .then(shopifyCart => {
      cartsCache[shopifyCart.id] = new Cart(shopifyCart)
      return get(shopifyCart.id)
    })
}

export const get = (id) => {

  if (cartsCache[id]) {
    return new Promise((resolve) => {
      resolve(cartsCache[id])
    })
  }
  return ShopifyClient.fetchCart(id)
    .then(shopifyCart => {
      cartsCache[shopifyCart.id] = new Cart(shopifyCart)
      return get(shopifyCart.id)
    })
}
