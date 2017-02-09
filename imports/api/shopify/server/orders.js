import {ShopifyApi} from './shopify'

export const create = (data) => {
  return new Promise((resolve, reject) => {
    ShopifyApi.post(`/admin/orders`, {order: data}, (error, response, headers) => {
      if (error) {
        reject(error)
      } else {
        resolve(response.order)
      }
    })
  })
}
