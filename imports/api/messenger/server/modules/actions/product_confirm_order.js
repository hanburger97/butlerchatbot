import {BaseAction} from './'
const PRODUCTS_CONFIRM_ORDER = 'PRODUCTS_CONFIRM_ORDER'
import {create as createOrder} from '/imports/api/shopify/server/orders'

import Orders from '/imports/api/orders/orders'

export default class ProductConfirmOrder extends BaseAction {

  static getActionPostback(day) {
    return PRODUCTS_CONFIRM_ORDER + JSON.stringify({
          deliveryDay: day
        })
  }

  canHandlePostback(postBack) {
    return postBack.indexOf(PRODUCTS_CONFIRM_ORDER) == 0
  }

  handle({payload, reply, senderId, customer, queryUrl}) {
    let query = queryUrl.substring(PRODUCTS_CONFIRM_ORDER.length)
    if (query){
      query = JSON.parse(query)
    }
    const day = query.deliveryDay
    if (day){
      const promise = new Promise(() => {
        return customer.getCart()
            .then(cart => {
              return customer.getAddresses()
                  .then(addresses => {
                    const lineItems = []

                    let subtotal = 0

                    cart.products.forEach(product => {
                      const variant = product.variants[0]
                      subtotal += variant.price * product.quantity

                      lineItems.push({
                        id: variant.id,
                        fulfillable_quantity: product.quantity,
                        price: variant.price,
                        product_id: product.product_id,
                        quantity: product.quantity,
                        requires_shipping: true,
                        sku: product.sku,
                        title: product.title
                      })


                    })


                    const order = {
                      email: customer.email,
                      send_receipt: true,
                      send_fulfillment_receipt: true,
                      line_items: lineItems,
                      note:`Jour de livraison: ${day}`,
                      shipping_address: addresses[0],
                      financial_status: 'authorized',
                      processing_method: "direct",
                      gateway: 'stripe',
                      test:true,
                      customer: {
                        id: customer.shopify.id
                      },
                      subtotal: subtotal
                    }
                    console.log(order)
                    return createOrder(order)
                        .then(shopifyOrder => {
                          return Orders.insert({customer_id: customer._id, data: shopifyOrder})

                        })
                        .then(orderId => {
                          reply({
                            message: {
                              attachment:{
                                type:'template',
                                payload:{
                                  template_type:'button',
                                  text: `Parfait, la livraison a votre porte se fera le ${day}, une copie de votre commande a ete envoyee a votre courriel`,
                                  buttons :[
                                    {
                                      type:'web_url',
                                      title:'Passer a la caisse',
                                      url: Meteor.absoluteUrl(`/charge/${orderId}`),
                                      webview_height_ratio: 'large'
                                    },
                                    {
                                      type:'postback',
                                      title:'Retour au menu',
                                      payload:'SERVICES'
                                    },
                                    {
                                      type:'postback',
                                      title:'Continuer dans Epicerie',
                                      payload:'Épicerie fine'
                                    }
                                  ]
                                }
                              }
                            }
                          })
                           customer.clearCart();

                         }

                        )



                  })

            })
      })
      return promise
    } else {
      return reply({
        message: {
          text:'Veuillez indiquer le journee de votre livraison',
          quick_replies: [
            {
              content_type:'text',
              title:'Lundi',
              payload: ProductConfirmOrder.getActionPostback('lundi')
            },
            {
              content_type:'text',
              title:'Mercredi',
              payload: ProductConfirmOrder.getActionPostback('mercredi')
            },
            {
              content_type:'text',
              title:'Vendredi',
              payload: ProductConfirmOrder.getActionPostback('vendredi')
            }
          ]

        }
      })
    }
  }

}
