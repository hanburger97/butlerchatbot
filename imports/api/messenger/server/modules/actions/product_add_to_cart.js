import {BaseAction, ProductUpdateQuantity, ProductShowCart} from './index'
const PRODUCT_ADD_TO_CART = '//PRODUCTS/CART/ADD_TO_CART/'
import {get2 as getProduct2} from '/imports/api/products/server/methods'

export default class ProductAddToCart extends BaseAction {

  static getActionPostback(productId) {
    return PRODUCT_ADD_TO_CART + JSON.stringify({product_id: productId})
  }

  canHandlePostback(postBack) {
    return postBack.indexOf(PRODUCT_ADD_TO_CART) == 0
  }

  handle({payload, reply, senderId, customer, queryUrl}) {

    let productId
    let query = queryUrl.substring(PRODUCT_ADD_TO_CART.length)

    if (query) {
      productId = JSON.parse(query).product_id
    }
    const quantity = query.quantity

    if (quantity){
      return getProduct2(productId)
          .then(product => {
            return customer.getCart()
                .then(cart => {
                  cart.addProduct(product, quantity)
                  return reply({
                    message: {
                      "text": `(${quantity}) ${product.title} a été ajouté à votre panier.`,
                      "quick_replies": [
                        /*{
                          "content_type": "text",
                          "title": "Changer la quantité",
                          "payload": ProductUpdateQuantity.getActionPostback(product.product_id)
                        },*/
                        {
                          "content_type": "text",
                          "title": "Voir mon panier",
                          "payload": ProductShowCart.getActionPostback(),

                        }

                      ]
                    }
                  })
                })
          })
    }
    else{
      return reply({
        message: {
          text: "Veuillez choisir la quantité que vous voulez",
          "quick_replies": [
            {
              "content_type": "text",
              "title": "Canceler",
              "payload": 'Épicerie fine',
            },
            {
              "content_type": "text",
              "title": "1",
              "payload": PRODUCT_ADD_TO_CART + JSON.stringify(Object.assign({quantity: 1}, query)),
            },
            {
              "content_type": "text",
              "title": "2",
              "payload": PRODUCT_ADD_TO_CART + JSON.stringify(Object.assign({quantity: 2}, query)),
            },
            {
              "content_type": "text",
              "title": "3",
              "payload": PRODUCT_ADD_TO_CART + JSON.stringify(Object.assign({quantity: 3}, query)),
            },
            {
              "content_type": "text",
              "title": "4",
              "payload": PRODUCT_ADD_TO_CART + JSON.stringify(Object.assign({quantity: 4}, query)),
            },
            {
              "content_type": "text",
              "title": "5",
              "payload": PRODUCT_ADD_TO_CART + JSON.stringify(Object.assign({quantity: 5}, query)),
            },
            {
              "content_type": "text",
              "title": "6",
              "payload": PRODUCT_ADD_TO_CART + JSON.stringify(Object.assign({quantity: 6}, query)),
            },
            {
              "content_type": "text",
              "title": "7",
              "payload": PRODUCT_ADD_TO_CART + JSON.stringify(Object.assign({quantity: 7}, query)),
            },
            {
              "content_type": "text",
              "title": "8",
              "payload": PRODUCT_ADD_TO_CART + JSON.stringify(Object.assign({quantity: 8}, query)),
            },
            {
              "content_type": "text",
              "title": "9",
              "payload": PRODUCT_ADD_TO_CART + JSON.stringify(Object.assign({quantity: 9}, query)),
            },
            {
              "content_type": "text",
              "title": "10",
              "payload": PRODUCT_ADD_TO_CART + JSON.stringify(Object.assign({quantity: 10}, query)),
            },
          ]
        }
      })
    }







  }
}
