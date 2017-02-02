import {ShopifyApi} from '/imports/api/shopify/server/shopify'

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

export const getFromVarId = (id) => (
    new Promise((resolve, reject) => {
        ShopifyApi.get(`/admin/variants/${id}.json`, (error, response, headers) => {
            if (error) {
                reject(error)
            } else {
                resolve(get(response.variant.product_id))
            }
        })
    })
)
export const cartPaging = (nb, total) => {
  var pl = total - ((nb -1)* 4)
  if (pl <= 4)
    return pl
  else
    return 4
}

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