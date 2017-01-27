import Shopify from '/imports/api/shopify/server/shopify'

export const list = (query = {}) => (
  new Promise((resolve, reject) => {
    Shopify.get('/admin/products.json', query, (error, response, headers) => {
      console.log(arguments)
      if (error) {
        reject(error)
      } else {
        resolve(response.products)
      }
    })
  })
)

Meteor.methods({
  'products.list': () => {
    return getAll()
  }
})
