import {ShopifyApi} from './shopify'

export const create = (data) => {
  return new Promise((resolve, reject) => {
    ShopifyApi.post('/admin/customers.json', data, (error, response, headers) => {
      if (error) {
        reject(error)
      } else {
        resolve(response.customer)
      }
    })
  })
}

export const update = (customerId, data) => {
  return new Promise((resolve, reject) => {
    ShopifyApi.put(`/admin/customers/${customerId}.json`, {customer: data}, (error, response, headers) => {
      if (error) {
        reject(error)
      } else {
        resolve(response.customer)
      }
    })
  })
}
