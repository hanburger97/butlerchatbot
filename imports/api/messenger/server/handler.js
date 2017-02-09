import Bot from './Bot'

import {get as getCustomer, create as createCustomer} from '/imports/api/customers/server/methods'

import {create as createShopifyCustomer} from '/imports/api/shopify/server/customer'
import {create as createShopifyCustomerAddress} from '/imports/api/shopify/server/customer_address'

import productHandler from './modules/product_handler'
import defaultHandler from './modules/default_handler'
import gettingStartedHandler from './modules/getting_started_handler'

Bot.on('message', (args) => {
  handle(args)
})

Bot.on('postback', (args) => {
  handle(args)
});

const handle = (args) => {
  const {payload, reply, senderId} = args

  let queryUrl = ""

  if (payload.postback && payload.postback.payload) {
    queryUrl = payload.postback.payload
  } else if (payload.message && payload.message.quick_reply) {
    queryUrl = payload.message.quick_reply.payload
  }

  const customerData = {'sender_id': senderId}

  getCustomer(customerData)
    .catch(err => {
      return Bot.getProfile(senderId)
        .then(profile => {
          return createCustomer(Object.assign({metadata: profile}, customerData))
            .then(() => {
              return getCustomer(customerData)
            })
        })
    })
    .then(customer => {
      if (!customer.shopify) {
        // No shopify customer account created. Create one
        return createShopifyCustomer({
          customer: {
            'first_name': customer.metadata.first_name,
            'last_name': customer.metadata.last_name
          }
        })
          .then((shopifyCustomer) => {
            customer.set('shopify', shopifyCustomer)
            customer.save()
            return shopifyCustomer
          })
          .then(shopifyCustomer => {
            return createShopifyCustomerAddress(shopifyCustomer.id,
              {
                address: {
                  "address1": "1140 Rue Wellington",
                  "city": "Montreal",
                  "province": "QC",
                  "zip": "H3C 1V8",
                  "last_name": customer.metadata.last_name,
                  "first_name": customer.metadata.first_name,
                  "country_code": "CA",
                  "country_name": "Canada"
                }
              })
              .then(() => {
                return customer
              })
          })
      }
      return customer
    })
    .then(customer => {
      const args2 = Object.assign({
        customer, queryUrl
      }, args)

      return productHandler.handle(args2)
        .catch(err => {
          if (err) {
            throw err
          }
          return gettingStartedHandler.handle(args2)
            .catch(err => {
              if (err) {
                throw err
              }
              return defaultHandler.handle(args2)
            })
        })
    })
    .catch(err => {
      if (process.env.DEBUG) {
        reply({message: {text: "DEBUG: Une erreur est survenue"}})
        reply({message: {text: err.message}})
      }
      throw console.log(err)

    })
}


