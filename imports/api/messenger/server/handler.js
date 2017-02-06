import Bot from './Bot'

import {get as getCustomer, create as createCustomer} from '/imports/api/customers/server/methods'
import productHandler from './modules/product_handler'
import defaultHandler from './modules/default_handler'
import gettingStartedHandler from './modules/getting_started_handler'

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

      return productHandler.handle({payload, reply, senderId, customer, queryUrl})
        .catch(err => {
          if (err) {
            throw err
          }
          return gettingStartedHandler.handle({payload, reply, senderId, customer, queryUrl})
            .catch(err => {
              if (err) {
                throw err
              }
              return defaultHandler.handle({payload, reply, senderId, customer, queryUrl})
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


