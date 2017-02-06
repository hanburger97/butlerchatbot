import Bot from './Bot'

import {get as getCustomer, create as createCustomer} from '/imports/api/customers/server/methods'
import productHandler from './modules/productHandler'
import defaultHandler from './modules/default'

Bot.on('message', (args) => {
  handle(args)
})

Bot.on('postback', (args) => {
  handle(args)
});

const handle = ({payload, reply, senderId}) => {
  let queryUrl = ""

  if (payload.postback && payload.postback.payload) {
    queryUrl = payload.postback.payload
  } else if (payload.message && payload.message.quick_reply) {
    queryUrl = payload.message.quick_reply.payload
  }

  let customerData = {'sender_id': senderId}
  getCustomer(customerData)
    .catch(err => {
      return createCustomer(customerData)
        .then(customerId => {
          return getCustomer(customerData)
        })
    })
    .then(customer => {
      productHandler.handle({payload, reply, senderId, customer, queryUrl})
        .catch(err => {
          if (err) {
            throw err
          }
          return defaultHandler.handle({payload, reply, senderId, customer, queryUrl})
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
