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

    return getProduct2(productId)
      .then(product => {
        return customer.getCart()
          .then(cart => {
            cart.addProduct(product)
            return reply({
              message: {
                "text": `(1) ${product.title} a été ajouté à votre panier.`,
                "quick_replies": [
                  {
                    "content_type": "text",
                    "title": "Changer la quantité",
                    "payload": ProductUpdateQuantity.getActionPostback(product.product_id)
                  },
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
}
