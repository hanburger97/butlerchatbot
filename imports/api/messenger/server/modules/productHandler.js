import {BaseHandler} from './handlers'

class ProductHandler extends BaseHandler {
  constructor() {
    super()
  }

  handle({payload, reply, senderId, customer}) {
    const promise = new Promise((resolve, reject) => {
      import {list as listProduct, count as countProducts} from '/imports/api/products/server/methods'
      import {get as getProduct, get2 as getProduct2} from '/imports/api/products/server/methods'

      let postbackurl = ""

      if (payload.postback && payload.postback.payload) {
        postbackurl = payload.postback.payload
      } else if (payload.message && payload.message.quick_reply) {
        postbackurl = payload.message.quick_reply.payload
      }

      let SHOW_PRODUCTS = '//SHOW_PRODUCTS/'
      let PRODUCT_ADD_TO_CART = '//PRODUCTS/CART/ADD_TO_CART/'
      const PRODUCTS_CART_UPDATE_QUANTITY = '//PRODUCTS/CART/CHANGE_QUANTITY/'

      if (postbackurl.indexOf(SHOW_PRODUCTS) == 0) {

        let query = postbackurl.substring(SHOW_PRODUCTS.length)
        if (query) {
          query = JSON.parse(query)
        }

        return countProducts(query)
          .then((count) => {
            if (query['page'] === undefined)
              query['page'] = 1

            if (query['limit'] === undefined)
              query['limit'] = 9

            return listProduct(query)
              .then((products) => {
                if (products.length == 0) {
                  reply({message: {text: "Il n'y a pas de produit chez ce marchand."}})
                } else {

                  const elements = []

                  products.forEach((product) => {
                    let subtitle = product.body_html
                    subtitle = subtitle.replace('<p>', '')
                    subtitle = subtitle.replace('</p>', '')

                    elements.push({
                      title: `${product.title} - (${product.variants[0].price}$)`,
                      image_url: product.image ? product.image.src : "https://placehold.it/100x75",
                      subtitle: subtitle,
                      buttons: [{
                        type: "postback",
                        title: "Ajouter à mon panier",
                        payload: PRODUCT_ADD_TO_CART + JSON.stringify({product_id: product.id}, null, 0)
                      }]
                    })
                  })

                  if (count > (query.page * query.limit)) {
                    let viewMorePayload = Object.assign({}, query, {page: query.page + 1})
                    elements.push({
                      title: `Page ${query.page} sur ${Math.ceil(count / query.limit)}`,
                      buttons: [{
                        type: "postback",
                        title: "Prochaine page",
                        payload: SHOW_PRODUCTS + JSON.stringify(viewMorePayload, null, 0)
                      }]
                    })
                  }

                  reply({
                    "message": {
                      "attachment": {
                        "type": "template",
                        "payload": {
                          "template_type": "generic",
                          "elements": elements
                        }
                      }
                    }
                  })


                }
              })
          })
          .catch((err) => {

            console.log(error)
            throw err
          })

      }
      else if (postbackurl.indexOf(PRODUCT_ADD_TO_CART) == 0) {

        let productId
        let query = postbackurl.substring(PRODUCT_ADD_TO_CART.length)
        if (query) {
          productId = JSON.parse(query).product_id
        }

        return getProduct2(productId)
          .then(product => {
            return customer.getCart()
              .catch(err => {
                return customer.createCart()
              })
              .then(cart => {
                cart.addProduct(product)
                  .catch(err => {
                    console.log(err)
                  })
                reply({
                  message: {
                    "text": `${cart.getQuantityOfProduct(product)} x "${product.title}" est dans votre panier.`,
                    "quick_replies": [
                      {
                        "content_type": "text",
                        "title": "Changer la quantité",
                        "payload": PRODUCTS_CART_UPDATE_QUANTITY + JSON.stringify({
                          product_id: product.product_id
                        }),
                      }

                    ]
                  }
                })
              })
          })
      }
      else if (postbackurl.indexOf(PRODUCTS_CART_UPDATE_QUANTITY) == 0) {
        let query = postbackurl.substring(PRODUCTS_CART_UPDATE_QUANTITY.length)
        if (query) {
          query = JSON.parse(query)
          if (!query.product_id) {
            throw new Meteor.Error('MISSING_PARAM', 'Missing parameter', "Missing parameter product_id.")
          }

        }

        if (query.quantity || query.quantity == 0) {
          return getProduct(query.product_id)
            .then(product => {
              const quantity = query.quantity
              if (quantity == 0) {
                return customer.getCart()
                  .then((cart) => {
                    cart.removeProductId(query.product_id)
                    return reply({message: {text: `Le produit "${product.title}" a été enlevé de votre panier.`}})
                  })

              } else {
                return customer.getCart()
                  .then(cart => {
                    cart.updateProductId(query.product_id, quantity)
                    return reply({message: {text: `Vous avez désormais ${quantity} x "${product.title}" dans votre panier.`}})
                  })
                  .catch(err => {
                    console.log(err)
                    throw err
                  })

              }
            })

        } else {
          return reply({
            message: {
              text: "Veuillez choisir la quantité",
              "quick_replies": [
                {
                  "content_type": "text",
                  "title": "1",
                  "payload": PRODUCTS_CART_UPDATE_QUANTITY + JSON.stringify(Object.assign({quantity: 1}, query)),
                },
                {
                  "content_type": "text",
                  "title": "2",
                  "payload": PRODUCTS_CART_UPDATE_QUANTITY + JSON.stringify(Object.assign({quantity: 2}, query)),
                },
                {
                  "content_type": "text",
                  "title": "3",
                  "payload": PRODUCTS_CART_UPDATE_QUANTITY + JSON.stringify(Object.assign({quantity: 3}, query)),
                },
                {
                  "content_type": "text",
                  "title": "4",
                  "payload": PRODUCTS_CART_UPDATE_QUANTITY + JSON.stringify(Object.assign({quantity: 4}, query)),
                },
                {
                  "content_type": "text",
                  "title": "5",
                  "payload": PRODUCTS_CART_UPDATE_QUANTITY + JSON.stringify(Object.assign({quantity: 5}, query)),
                },
                {
                  "content_type": "text",
                  "title": "6",
                  "payload": PRODUCTS_CART_UPDATE_QUANTITY + JSON.stringify(Object.assign({quantity: 6}, query)),
                },
                {
                  "content_type": "text",
                  "title": "7",
                  "payload": PRODUCTS_CART_UPDATE_QUANTITY + JSON.stringify(Object.assign({quantity: 7}, query)),
                },
                {
                  "content_type": "text",
                  "title": "8",
                  "payload": PRODUCTS_CART_UPDATE_QUANTITY + JSON.stringify(Object.assign({quantity: 8}, query)),
                },
                {
                  "content_type": "text",
                  "title": "9",
                  "payload": PRODUCTS_CART_UPDATE_QUANTITY + JSON.stringify(Object.assign({quantity: 9}, query)),
                },
                {
                  "content_type": "text",
                  "title": "10",
                  "payload": PRODUCTS_CART_UPDATE_QUANTITY + JSON.stringify(Object.assign({quantity: 10}, query)),
                },
                {
                  "content_type": "text",
                  "title": "Retirer",
                  "payload": PRODUCTS_CART_UPDATE_QUANTITY + JSON.stringify(Object.assign({quantity: 0}, query)),
                },
              ]
            }
          })
        }

      }
      reject(new Meteor.Error('NOT_HANDLED', 'Not handled by product handler'))
    })


    return promise

  }
}

export default new ProductHandler()

import BaseAction from './actions/BaseAction'

class ChangeQuantityAction extends BaseAction {


}
