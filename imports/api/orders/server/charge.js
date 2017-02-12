import Orders from '../orders'
import Charges from '/imports/api/stripe/charges/charges'
import {create as createStripeCharge} from '/imports/api/stripe/charges/methods'
import {updateOrderCapture} from '/imports/api/shopify/server/orders'
import Customers from '/imports/api/customers/customers'

import {update as updateStripeCustomer} from '/imports/api/stripe/customers'

import {stripeAmount} from '/imports/lib/helpers/stripe'

Meteor.methods({
  'charge': function ({orderId, tokenId}) {
    return Orders.findOne(orderId)
      .then((order) => {
        return Customers.findOne(order.customer_id)
          .then(customer => {
            return customer.getStripeCustomer()
              .then(stripeCustomer => {
                return updateStripeCustomer(stripeCustomer.id, {source: tokenId})
                  .then(() => {
                    return createStripeCharge({
                      amount: stripeAmount(order.data.total_price),
                      description: order.data.name,
                      currency: "cad",
                      customer: stripeCustomer.id
                    })
                      .then(charge => {
                        return Charges.insert({customer_id: order.customer_id, order_id: order._id, data: charge})
                          .then(() => {
                            return updateOrderCapture(order.data.id)
                          })
                          .then(shopifyOrder => {
                            return Orders.update({'data.id': shopifyOrder.id}, {$set: {data: shopifyOrder}})
                          })
                      })
                  })

              })

          })

      })
      .then(() => {
        return 'success'
      })
  }
})


