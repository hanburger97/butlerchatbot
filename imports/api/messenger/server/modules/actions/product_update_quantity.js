import BaseAction from './BaseAction'

const PRODUCTS_CART_UPDATE_QUANTITY = '//PRODUCTS/CART/CHANGE_QUANTITY/'
import {get2 as getProduct2} from '/imports/api/products/server/methods'

export default class ProductUpdateQuantity extends BaseAction {

  static getActionPostback(productId) {
    return PRODUCTS_CART_UPDATE_QUANTITY + JSON.stringify({
        product_id: productId
      })
  }

  canHandlePostback(postBack) {
    return postBack.indexOf(PRODUCTS_CART_UPDATE_QUANTITY) == 0
  }

  handle({payload, reply, senderId, customer, queryUrl}) {
    let query = queryUrl.substring(PRODUCTS_CART_UPDATE_QUANTITY.length)
    if (query) {
      query = JSON.parse(query)
      if (!query.product_id) {
        throw new Meteor.Error('MISSING_PARAM', 'Missing parameter', "Missing parameter product_id.")
      }
    }
    const quantity = query.quantity
    const productId = query.product_id
    if (quantity) {
      return getProduct2(productId)
        .then(product => {
          return customer.getCart()
            .then(cart => {

              if (quantity == 0) {
                cart.removeProductId(productId)
                return reply({message: {text: `Le produit "${product.title}" a été enlevé de votre panier.`}})
              } else {
                cart.updateProductId(productId, quantity)
                return cart._fillShopifyCart()
                  .then((shopifyCart) => {
                    return reply({
                      message: {
                        text: `Vous avez désormais ${quantity} x "${product.title}" dans votre panier. Pour un total de ${shopifyCart.subtotal}$.`,
                        quick_replies:[
                          {
                            content_type: "text",
                            title: "Voir panier",
                            payload: "//SHOW_CART/"
                          }
                        ]
                      }
                    })
                  })
              }
            })
        })
    } else {
      return reply({
        message: {
          text: "Veuillez choisir la quantité que vous voulez",
          "quick_replies": [
            {
              "content_type": "text",
              "title": "Retirer du panier",
              "payload": PRODUCTS_CART_UPDATE_QUANTITY + Object.assign({quantity: 0}, query),
            },
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
          ]
        }
      })
    }

  }
}