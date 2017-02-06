import {BaseAction, ProductUpdateQuantity} from './index'
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
          console.log(pageNb)
          import {get as getProduct} from '/imports/api/products/server/methods'

          const lineItems = cart.products
          const promises = []
          lineItems.forEach(item => {
            promises.push(getProduct(item.product_id))
          })

          return Promise.all(promises).then(products => {
            const elements = []
            import {cartPaging} from '/imports/api/products/server/methods'
            var rmdr = cartPaging(pageNb, products.length)
            console.log(rmdr)
            console.log(pageNb)
            if (rmdr == 0) {
              reply({
                message: {
                  "text": "Votre panier est vide"
                }

              })
            } else if (rmdr == 1) {
              const ind = (pageNb * 4)
              var product = products[ind]
              var lineItem = lineItems[ind]
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
                          "subtitle": lineItem.price,
                          "buttons": [
                            {
                              "type": "postback",
                              "title": "Modifier",
                              "payload": ProductUpdateQuantity.getActionPostback(product.id)
                            },
                            {
                              "type": "postback",
                              "title": "Retour aux produits",
                              "payload": '//SHOW_PRODUCTS/{\"vendor\":\"Alexis le gourmand\"}'
                            },
                            {
                              "type": "postback",
                              "title": "Email",
                              "payload": 'EMAIL'
                            }
                          ]
                        }
                      ]

                    }
                  }
                }

              })
            } else {
              //Send only block
              for (var i = (pageNb * 4); i < (pageNb * 4) + rmdr; i++) {
                var product = products[i]
                var lineItem = lineItems[i]
                var img = ''
                if (product.images && product.images.length > 0) {
                  img = product.images[0].src
                } else {
                  img = "https://img0.etsystatic.com/108/0/10431067/il_340x270.895571854_5n8v.jpg"
                }
                elements.push({
                  "title": product.title,
                  "image_url": img,
                  "subtitle": lineItem.price,
                  "buttons": [
                    {
                      "type": "postback",
                      "title": "Modifier",
                      "payload": ProductUpdateQuantity.getActionPostback(product.id)
                    }
                  ]
                })
              }
              reply({
                message: {
                  "attachment": {
                    "type": "template",
                    "payload": {
                      "template_type": "list",
                      "top_element_style": "compact",
                      "elements": elements,
                      "buttons": [
                        {
                          "title": "Voir prochaine page",
                          "type": "postback",
                          "payload": ProductShowCart.getActionPostback(pageNb + 1)
                        }
                      ]
                    }
                  }
                }
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
                          "type": "web_url",
                          "url": cart.checkoutUrl,
                          "title": "Proceder au payment",
                          "webview_height_ratio": "tall"
                        },
                        {
                          "type": "postback",
                          "title": "Retour aux produits",
                          "payload": '//SHOW_PRODUCTS/{\"vendor\":\"Alexis le gourmand\"}'
                        },
                        {
                          "type": "postback",
                          "title": "Email le recu",
                          "payload": 'EMAIL'
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
