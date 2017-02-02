import {ShopifyApi, ShopifyClient} from '/imports/api/shopify/server/shopify'

export const list = (query = {}) => (
  new Promise((resolve, reject) => {
    ShopifyApi.get('/admin/products.json', query, (error, response, headers) => {
      if (error) {
        reject(error)
      } else {
        resolve(response.products)
      }
    })
  })
)

export const get = (id) => (
  new Promise((resolve, reject) => {
    ShopifyApi.get(`/admin/products/${id}.json?fields=id,images,title`, (error, response, headers) => {
      if (error) {
        reject(error)
      } else {
        resolve(response.product)
      }
    })
  })
)

export const get2 = (id) => (
  ShopifyClient.fetchProduct(id)
    .then(productWrapper => {
      return productWrapper.attrs
    })
)

export const count = (query) => (
  new Promise((resolve, reject) => {
    ShopifyApi.get('/admin/products/count.json', query, (error, response, headers) => {
      if (error) {
        reject(error)
      } else {
        resolve(response.count)
      }
    })
  })
)

Meteor.methods({
  'products.list': () => {
    return list()
  }
})

function test () {
  import {ShopifyClient} from '/imports/api/shopify/server/shopify'
  ShopifyClient.fetchQueryProducts({vendor: 'Alexis le gourmand'})
    .then(products => {
      console.log(products)
    })
}

//Meteor.bindEnvironment(test)()