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


export const get = (customerId) => {
  return new Promise((resolve, reject) => {
    ShopifyApi.get(`/admin/customers/${customerId}/addresses.json`, (error, response, headers) => {
      if (error) {
        reject(error)
      } else {
        resolve(response.addresses)
      }
    })
  })
}


export const update = (customerId, customerAddressId, data) => {
  return new Promise((resolve, reject) => {
    ShopifyApi.put(`/admin/customers/${customerId}/addresses/${customerAddressId}.json`, {address: data}, (error, response, headers) => {
      if (error) {
        reject(error)
      } else {
        resolve(response.customer_address)
      }
    })
  })
}

