import {ShopifyApi} from './shopify'

export const create = (customerId, data) => {
  return new Promise((resolve, reject) => {
    ShopifyApi.post(`/admin/customers/${customerId}/addresses.json`, data, (error, response, headers) => {
      if (error) {
        reject(error)
      } else {
        resolve(response.customer_address)
      }
    })
  })
}

