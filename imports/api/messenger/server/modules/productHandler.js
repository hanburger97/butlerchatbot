import {BaseHandler} from './handlers'

class ProductHandler extends BaseHandler {
  constructor() {
    super()
  }

  handle({payload, reply, senderId, customer}) {
    const promise = new Promise((resolve, reject) => {
      import {list as listProduct, count as countProducts} from '/imports/api/products/server/methods'
      let SHOW_CART = '//SHOW_CART/'


      //let CHECKOUT = '//CHECKOUT/'

      import {get as getProduct} from '/imports/api/products/server/methods'

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
        console.log(query)
        return countProducts(query)
            .then((count) => {
              console.log(query)
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
                            payload: PRODUCT_ADD_TO_CART + JSON.stringify(product.variants[0], null, 0)
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

      } else if (postbackurl.indexOf(PRODUCT_ADD_TO_CART) == 0) {


        let productVariant = postbackurl.substring(PRODUCT_ADD_TO_CART.length)
        if (productVariant) {
          productVariant = JSON.parse(productVariant)
        }

        return customer.getCart()
            .catch(err => {
              return customer.createCart()
            })
            .then(cart => {

              return cart.addProductVariant(productVariant)
                  .then(cart => {

                    getProduct(productVariant.product_id)
                        .then((product) => {
                          reply({
                            message: {
                              "text": `(1) ${product.title} a été ajouté à votre panier.`,
                              "quick_replies": [
                                {
                                  "content_type": "text",
                                  "title": "Changer la quantité",
                                  "payload": PRODUCTS_CART_UPDATE_QUANTITY + JSON.stringify({
                                    variant_id: productVariant.id,
                                    product_id: product.id
                                  }),

                                },
                                {
                                  "content_type": "text",
                                  "title": "Voir Panier",
                                  "payload": '//SHOW_CART/',

                                }

                              ]
                            }
                          })
                        })
                    return cart
                  })
            })
      }
      else if (postbackurl.indexOf(PRODUCTS_CART_UPDATE_QUANTITY) == 0) {
        let query = postbackurl.substring(PRODUCTS_CART_UPDATE_QUANTITY.length)
        if (query) {
          query = JSON.parse(query)
          if (!query.variant_id) {
            throw new Meteor.Error('MISSING_PARAM', 'Missing parameter', "Missing parameter product_id.")
          }
        }

        if (query.quantity) {
          return getProduct(productVariant.product_id)
              .then(product => {
                const quantity = query.quantity
                if (quantity == 0) {
                  return customer.cart.removeProductId(query.productVariant.id)
                      .then(() => {
                        return reply({message: {text: `Le produit "${product.title}" a été enlevé de votre panier.`}})
                      })

                } else {
                  return customer.cart.updateVariantQuantity(query.productVariant.id, quantity)
                      .then(() => {
                        return reply({message: {text: `Vous avez désormais ${quantity} x ${product.title} dans votre panier.`}})
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
                  "payload": PRODUCTS_CART_UPDATE_QUANTITY + Object.assign({quantity: 2}, query),
                },
                {
                  "content_type": "text",
                  "title": "3",
                  "payload": PRODUCTS_CART_UPDATE_QUANTITY + Object.assign({quantity: 3}, query),
                },
                {
                  "content_type": "text",
                  "title": "4",
                  "payload": PRODUCTS_CART_UPDATE_QUANTITY + Object.assign({quantity: 4}, query),
                },
                {
                  "content_type": "text",
                  "title": "5",
                  "payload": PRODUCTS_CART_UPDATE_QUANTITY + Object.assign({quantity: 5}, query),
                },
                {
                  "content_type": "text",
                  "title": "6",
                  "payload": PRODUCTS_CART_UPDATE_QUANTITY + Object.assign({quantity: 6}, query),
                },
                {
                  "content_type": "text",
                  "title": "7",
                  "payload": PRODUCTS_CART_UPDATE_QUANTITY + Object.assign({quantity: 7}, query),
                },
                {
                  "content_type": "text",
                  "title": "8",
                  "payload": PRODUCTS_CART_UPDATE_QUANTITY + Object.assign({quantity: 8}, query),
                },
                {
                  "content_type": "text",
                  "title": "9",
                  "payload": PRODUCTS_CART_UPDATE_QUANTITY + Object.assign({quantity: 9}, query),
                },
                {
                  "content_type": "text",
                  "title": "10",
                  "payload": PRODUCTS_CART_UPDATE_QUANTITY + Object.assign({quantity: 10}, query),
                },
                {
                  "content_type": "text",
                  "title": "Retirer",
                  "payload": PRODUCTS_CART_UPDATE_QUANTITY + Object.assign({quantity: 0}, query),
                },
              ]
            }
          })
        }


      }
      else if (postbackurl.indexOf(SHOW_CART) == 0) {

        return customer.getCart()
            .catch(err => {
              return customer.createCart()
            })
            .then(cart => {
                  import {getFromVarId} from '/imports/api/products/server/methods'
                  console.log(cart)
                  const lineItems = cart.shopifyCart.attrs.line_items

                  const promises = []
                  lineItems.forEach(item => {
                    promises.push(getFromVarId(item.variant_id))
                  })
                  console.log(promises)
                  //var productsPage = []
                  return Promise.all(promises).then(products => {
                    /*if (products.length <= 3)
                     productsPage.push(products)
                     else
                     productsPage.push(products.splice)*/
                    if (products.length == 0)
                      reply({
                        message: {
                          "text": "Votre panier est vide"
                        }

                      })
                    console.log(products)
                    console.log(lineItems)
                    const elements = []
                    for (var i = 0; i < products.length; i++) {
                      var product = products[i]
                      var lineItem = lineItems[i]
                      elements.push({
                        "title": product.title,
                        "image_url": product.images[0].src || "https://img0.etsystatic.com/108/0/10431067/il_340x270.895571854_5n8v.jpg",
                        "subtitle": lineItem.price,
                        "buttons":[
                          {
                            "type":"postback",
                            "title":"Modifier",
                            "payload":PRODUCTS_CART_UPDATE_QUANTITY + JSON.stringify({
                              variant_id: lineItem.variant_id,
                              product_id: product.id
                            })
                          }
                        ]
                      })
                      console.log(lineItems)
                    }

                    console.log(elements)
                    debugger
                    reply({
                      message: {
                        "attachment": {
                          "type": "template",
                          "payload": {
                            "template_type": "list",
                            "top_element_style":"compact",
                            "elements": elements,
                            "buttons": [
                              {
                                "title": "View More",
                                "type": "postback",
                                "payload": "payload"
                              }
                            ]
                          }
                        }
                      }
                    })
                    reply({
                      message: {
                        "attachment":{
                          "type":"template",
                          "payload":{
                            "template_type":"button",
                            "text":"Que voulez-vous faire ensuite?",
                            "buttons":[
                              {
                                "type":"web_url",
                                "url":cart.checkoutUrl,
                                "title":"Proceder au payment",
                                "webview_height_ratio": "tall"
                              },
                              {
                                "type":"postback",
                                "title":"Retour aux produits",
                                "payload": SHOW_PRODUCTS
                              }
                            ]
                          }
                        }
                      }
                    })

                    console.log(elements)
                  })
                }
            )

      }
      reject(new Meteor.Error('NOT_HANDLED', 'Not handled by product handler'))
    })


    return promise

  }
}

export default new ProductHandler()


class Action {


}