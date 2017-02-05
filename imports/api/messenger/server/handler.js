import Bot from './Bot'

import {get as getCustomer, create as createCustomer} from '/imports/api/customers/server/methods'
import productHandler from './modules/productHandler'
import defaultHandler from './modules/default'

Bot.on('message', ({payload, reply, senderId}) => {

  let customerData = {'sender_id': senderId};
  getCustomer(customerData)
    .catch(err => {
      console.log(err)
      return createCustomer(customerData)
        .then(customerId => {
          return getCustomer(customerData)
        })
    })
    .then(customer => {
      productHandler.handle({payload, reply, senderId, customer})
        .catch(err => {
          return defaultHandler.handle({payload, reply, senderId, customer})
        })
    })
  /*reply({
    message: {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "button",
          "text": "Quel marchand voulez-vous voir?",
          "buttons": [
            {
              "type": "postback",
              "title": "Alexis le gourmand",
              "payload": '//SHOW_PRODUCTS/{"vendor":"Alexis le gourmand"}',
            },
            {
              "type": "postback",
              "title": "Alimentation maison",
              "payload": '//SHOW_PRODUCTS/{"vendor":"Alimentation maison"}',
            },
            {
              "type": "postback",
              "title": "Afficher panier",
              "payload": '//SHOW_CART/',
            }
          ]
        }
      }
    }*/
  })


Bot.on('postback', ({payload, reply, senderId}) => {
  let customerData = {'sender_id': senderId};
  getCustomer(customerData)
    .catch(err => {
      console.log(err)
      return createCustomer(customerData)
        .then(customerId => {
          return getCustomer(customerData)
        })
    })
    .then(customer => {
      productHandler.handle({payload, reply, senderId, customer})
        .catch(err => {
          return defaultHandler.handle({payload, reply, senderId, customer});
        })

    })
    .catch(err => {
      if (process.env.DEBUG) {
        reply({message: {text: "DEBUG: Une erreur est survenue"}})
        reply({message: {text: err.message}})
      }
      throw console.log(err)
    })

})
