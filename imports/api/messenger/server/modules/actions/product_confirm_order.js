import {BaseAction} from './'
const PRODUCTS_CONFIRM_ORDER = 'PRODUCTS_CONFIRM_ORDER'
import {create as createOrder} from '/imports/api/shopify/server/orders'

import Orders from '/imports/api/orders/orders'

export default class ProductConfirmOrder extends BaseAction {

  static getActionPostback() {
    return PRODUCTS_CONFIRM_ORDER
  }

  canHandlePostback(postBack) {
    return postBack.indexOf(PRODUCTS_CONFIRM_ORDER) == 0
  }

  handle({payload, reply, senderId, customer, queryUrl}) {
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
                shipping_address: addresses[0],
                financial_status: 'pending',
                processing_method: "direct",
                gateway: 'stripe',
                test:true,
                customer: {
                  id: customer.shopify.id
                },
                subtotal: subtotal
              }

              return createOrder(order)
                .then(shopifyOrder => {
                  Orders.insert(shopifyOrder)

                })

            })

        })
    })
    return promise
  }
}
