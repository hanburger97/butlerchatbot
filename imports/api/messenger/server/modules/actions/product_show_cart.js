import {BaseAction, ProductUpdateQuantity, ProductViewProducts, ProductConfirmOrder} from './index'
const SHOW_CART = '//SHOW_CART/'


export default class ProductShowCart extends BaseAction {

  static getActionPostback(page = 0) {
    if (page != 0)
      return SHOW_CART + page

    return SHOW_CART
  }

  canHandlePostback(postBack) {
    return postBack.indexOf(SHOW_CART) == 0
  }

  handle({payload, reply, senderId, customer, queryUrl}) {
    let pageNb = 0
    if (queryUrl.substring(SHOW_CART.length) !== '')
      pageNb = Number(queryUrl.substring(SHOW_CART.length))
    return customer.getCart()
      .then(cart => {
          import {get as getProduct} from '/imports/api/products/server/methods'

          const lineItems = cart.products

          if (lineItems.length === 0) {
            return reply({
              message: {
                "text": "Votre panier est vide"
              }

            })
          }

          const promises = []
          lineItems.forEach(item => {
            promises.push(getProduct(item.product_id))
          })

          return Promise.all(promises).then(products => {
            const pagesProducts = []
            let hasMore = false
            for (var i = pageNb * 4; i < products.length; i++) {
              if (pagesProducts.length === 4 && i < products.length) {
                hasMore = true
                break
              }
              pagesProducts.push(products[i])
            }

            if (pagesProducts.length == 1) {
              // One item. Due to Facebook's limitation, we cannot send a list less than 2 items. Send a generic template instead
              var product = pagesProducts[0]
              reply({
                message: {
                  "attachment": {
                    "type": "template",
                    "payload": {
                      "template_type": "generic",
                      "elements": [
                        {
                          "title": product.title,
                          "image_url": product.images.length ? product.images[0].src : "https://img0.etsystatic.com/108/0/10431067/il_340x270.895571854_5n8v.jpg",
                          "subtitle": product.price,
                          "buttons": [
                            {
                              "type": "postback",
                              "title": "Modifier",
                              "payload": ProductUpdateQuantity.getActionPostback(product.id)
                            }
                          ]
                        }
                      ]

                    }
                  }
                }

              })
            } else {

              const elements = []
              pagesProducts.forEach(product => {
                let img = ''
                if (product.images && product.images.length > 0) {
                  img = product.images[0].src
                } else {
                  img = "https://img0.etsystatic.com/108/0/10431067/il_340x270.895571854_5n8v.jpg"
                }
                elements.push({
                  "title": product.title,
                  "image_url": img,
                  "subtitle": product.price,
                  "buttons": [
                    {
                      "type": "postback",
                      "title": "Modifier",
                      "payload": ProductUpdateQuantity.getActionPostback(product.id)
                    }
                  ]
                })
              })

              const message = {
                "attachment": {
                  "type": "template",
                  "payload": {
                    "template_type": "list",
                    "top_element_style": "compact",
                    "elements": elements

                  }
                }
              }

              if (hasMore) {
                message.attachment.payload.buttons = [
                  {
                    "title": "Voir prochaine page",
                    "type": "postback",
                    "payload": ProductShowCart.getActionPostback(pageNb + 1)
                  }
                ]
              }

              reply({
                message
              })

              reply({
                message: {
                  "attachment": {
                    "type": "template",
                    "payload": {
                      "template_type": "button",
                      "text": "Que voulez-vous faire ensuite?",
                      "buttons": [
                        {
                          "title": "Soumettre la commande",
                          "type": "postback",
                          "payload": ProductConfirmOrder.getActionPostback()
                        },
                        {
                          "title": "Continuer à magasiner",
                          "type": "postback",
                          "payload": ProductViewProducts.getActionPostback()
                        }
                      ]
                    }
                  }
                }
              })
            }

          })
        }
      )
  }
}
