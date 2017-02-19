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
          console.log(products)
          console.log(lineItems)
          const pagesProducts = []
          let hasMore = false
          for (var i = pageNb * 4; i < products.length; i++) {
            if (pagesProducts.length === 4 && i < products.length) {
              hasMore = true
              break
            }
            console.log(products[0])
            pagesProducts.push({
              product: products[i],
              lineItem: lineItems[i]
            })
            console.log(pagesProducts)
          }

          if (pagesProducts.length == 1) {
            // One item. Due to Facebook's limitation, we cannot send a list less than 2 items. Send a generic template instead
            var product = pagesProducts[0].product
            var lineItem = pagesProducts[0].lineItem
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
                        "subtitle": `Quantité: ${lineItem.quantity}, Prix par unité: ${lineItem.variants[0].formatted_price}`,
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
                },
                "quick_replies": [
                  {
                    content_type: 'text',
                    title: 'Soumettre la commande',
                    payload: ProductConfirmOrder.getActionPostback()
                  },
                  {
                    content_type: 'text',
                    title: 'Continuer à magasiner',
                    payload: ProductViewProducts.getActionPostback()
                  }
                ]
              }

            })
          } else {

            const elements = []
            pagesProducts.forEach(p => {
              var product = p.product
              var lineItem = p.lineItem
              let img = ''
              if (product.images && product.images.length > 0) {
                img = product.images[0].src
              } else {
                img = "https://img0.etsystatic.com/108/0/10431067/il_340x270.895571854_5n8v.jpg"
              }
              elements.push({
                "title": product.title,
                "image_url": img,
                "subtitle": `Quantité: ${lineItem.quantity}, Prix par unité: ${lineItem.variants[0].formatted_price}`,
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
                  "title": "Voir la prochaine page",
                  "type": "postback",
                  "payload": ProductShowCart.getActionPostback(pageNb + 1)
                }
              ]
            }
            message.quick_replies = [
              {
                content_type: 'text',
                title: 'Soumettre la commande',
                payload: ProductConfirmOrder.getActionPostback()
              },
              {
                content_type: 'text',
                title: 'Continuer à magasiner',
                payload: ProductViewProducts.getActionPostback()
              }
            ]


            reply({
              message
            })
          }

        })
      }
     )
  }
}
