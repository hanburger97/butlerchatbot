import Shopify from '/imports/api/shopify/server/shopify'

export const list = () => (
  new Promise((resolve, reject) => {
    Shopify.get('/admin/products.json', {}, (error, response, headers) => {
      console.log(arguments)
      resolve(response.products)
    })
  })
)

Meteor.methods({
  'products.list': () => {
    return getAll()
  }
})
