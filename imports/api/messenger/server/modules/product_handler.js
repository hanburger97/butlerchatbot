import {BaseHandler} from './base_handler'
import {ProductShowCart, ProductUpdateQuantity, ProductAddToCart, ProductViewProducts, ProductConfirmOrder} from './actions'

class ProductHandler extends BaseHandler {
  constructor() {
    super()

    this.actions = [
      new ProductShowCart(),
      new ProductUpdateQuantity(),
      new ProductAddToCart(),
      new ProductViewProducts(),
      new ProductConfirmOrder()
    ]
  }

  handle({payload, reply, senderId, customer, queryUrl}) {
    const _this = this
    const promise = new Promise((resolve, reject) => {

      let handler = null
      for (i = 0; i < _this.actions.length; i++){
        if (_this.actions[i].canHandlePostback(queryUrl)){
          handler = _this.actions[i].handle({payload, reply, senderId, customer, queryUrl})
          return resolve(handler)
        }
      }
      /*_this.actions.forEach(action => {
        if (action.canHandlePostback(queryUrl)) {
          handler = action.handle({payload, reply, senderId, customer, queryUrl})
        }
      })*/

      /*if (handler) return handler*/

      const PRODUCTS_VIEW_CHECKOUT = '//PRODUCT/CART/CHECKOUT'

      if (queryUrl.indexOf(PRODUCTS_VIEW_CHECKOUT) == 0) {
        return customer.getCart()
          .then(cart => {
            return cart.getCheckoutUrl()
              .then(checkoutUrl => {
                return reply({
                  message: {
                    text: "Cliquer sur bouton pour ouvrir la page de paiement dans votre navigateur.",
                    "buttons": [
                      {
                        "type": "web_url",
                        "url": checkoutUrl,
                        "title": "Ouvrir",
                        "webview_height_ratio": "full"
                      }
                    ]
                  }
                })
              })
          })

      }


      reject()
    })


    return promise

  }
}

export default new ProductHandler()
