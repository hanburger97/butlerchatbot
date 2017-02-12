import {ShopifyApi} from './shopify'
import Orders from '/imports/api/orders/orders'

export const get = (orderId) => {
  return new Promise((resolve, reject) => {
    ShopifyApi.get(`/admin/orders/${orderId}.json`, {order: data}, (error, response, headers) => {
      if (error) {
        reject(error)
      } else {
        resolve(response.order)
      }
    })
  })
}


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

const update = (orderId, data = {}) => {

  return new Promise((resolve, reject) => {
    const order = Object.assign({id: orderId}, data)
    ShopifyApi.put(`/admin/orders/${orderId}.json`, {"order": order}, (error, response, headers) => {
      if (error) {
        reject(error)
      } else {
        resolve(response.order)
      }
    })
  })
}

export const updateOrderCapture = (orderId) => {
  return new Promise((resolve, reject) => {
    ShopifyApi.post(`/admin/orders/${orderId}/transactions.json`, {"transaction": {kind: "capture"}},
      (error, response, headers) => {
        if (error) {
          reject(error)
        } else {
          resolve()
        }
      })
  })
    .then(() => {
      return get(orderId)
    })
}
