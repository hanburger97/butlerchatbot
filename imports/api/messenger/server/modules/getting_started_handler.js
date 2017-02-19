import {BaseHandler} from './base_handler'
const GETTING_STARTED = 'GETTING_STARTED'
import Rooms from '/imports/api/rooms/Rooms'

class GettingStarted extends BaseHandler {

  constructor() {
    super()
    this.record = {}
  }

  handle({payload, reply, senderId, customer, queryUrl, emitPayload}) {
    const _this = this
    const promise = new Promise((resolve, reject) => {

      if (_this.record[senderId] && _this.record[senderId].room) {
        let tryAgain = false
        if (payload.message && payload.message.text) {
          try {
            const roomNumber = parseInt(payload.message.text)
            return Rooms.findOne({nb: roomNumber})
              .then(() => {
                customer.set('room', roomNumber)
                return customer.save()
              })
              .then(() => {
                delete _this.record[senderId]['room']

                import {get as getShopifyCustomerAddresses, update as updateShopifyCustomerAddresses} from '/imports/api/shopify/server/customer_address'
                return getShopifyCustomerAddresses(customer.shopify.id)
                  .then(customerAddresses => {
                    customerAddresses.forEach(customerAddress => {
                      if (customerAddress.address1 === '1140 Rue Wellington') {
                        return updateShopifyCustomerAddresses(customer.shopify.id, customerAddress.id, {address2: `#${roomNumber}`})
                      }

                    })
                  })
                  .then(() => {
                    reply({message: {text: `Merci ${customer.metadata.first_name}, la porte ${roomNumber} est maintenant associée à votre nom!`}})
                    emitPayload('START')
                  })
              })
              .catch((err) => {
                reply({message: {text: `Désolé, mais nous n'avons pas trouvé la porte "${payload.message.text}" à l'Hexagone.`}})
                //reemit()
                setTimeout(() => {
                  reply({
                    message: {
                      text: `Veuillez écrire votre numéro de porte:`,
                    }
                  })
                }, 500)
                return
              })


          } catch (e) {
            reply({message: {text: `"${payload.message.text}" n'est pas un numéro.`}})
            tryAgain = true
          }
        } else {
          tryAgain = true
        }

        if (tryAgain) {
          setTimeout(() => {
            reply({
              message: {
                text: `Veuillez écrire votre numéro de porte:`,
              }
            })
          }, 500)
        }

        return


      }

      if (_this.record[senderId] && _this.record[senderId].email) {
        if (payload.message && payload.message.text) {
          const email = payload.message.text
          if (!validateEmail(email)) {
            reply({message: {text: `Désolé, "${email}" n'est pas un courriel valide.`}})
            setTimeout(() => {
              reply({
                message: {
                  text: `Veuillez écrire votre courriel: `,
                }
              })
            }, 500)
            return
          }

          customer.set('email', email)
          return customer.save()
            .then(() => {
              reply({message: {text: `Merci, le courriel ${email} a été ajouté à votre dossier.`}})
              delete _this.record[senderId]['email']

              import {update as updateShopifyCustomer} from '/imports/api/shopify/server/customer'
              const shopifyCustomer = customer.shopify
              emitPayload('START')
              return updateShopifyCustomer(shopifyCustomer.id, {email, send_email_welcome: true})
            })
        }
      }


      if (queryUrl.toUpperCase() === 'START') {

        // Check if we need to record the room first or not
        if (!customer.room) {

          _this.record[senderId] = {
            room: true
          }

          reply({
            message: {
              text: `Bonjour ${customer.metadata.first_name}, je suis Albert, votre concierge virtuel, exclusif aux résidents de L'Hexagone.`,
            }
          })

          setTimeout(() => {
            reply({
              message: {
                text: `Avant de commencer, veuillez simplement écrire votre numéro de porte dans l'immeuble.`,
              }
            })
          }, 500)

          return

        }

        if (!customer.email) {

          _this.record[senderId] = {
            email: true
          }

          setTimeout(() => {
            reply({
              message: {
                text: `Veuillez maintenant indiquer l'adresse courriel qui servira à vous identifier`,
              }
            })
          }, 500)

          return

        }

        return reply({
          message: {
            "attachment": {
              "type": "template",
              "payload": {
                "template_type": "generic",
                "elements": [
                  {
                    "title": `Bonjour ${customer.metadata.first_name}, que puis-je faire pour vous aujourd'hui?`,
                    "image_url": "http://res.cloudinary.com/hanburger97/image/upload/v1484877846/71-v-Appartements_a_louer_a_Griffintown__Location_Hexagone_vpq0eh.jpg",
                    "subtitle": "",
                    "buttons": [
                      {
                        "type": "postback",
                        "title": "Voir les services",
                        "payload": "SERVICES"
                      },
                      {
                        "type": "postback",
                        "title": "Comment ça marche?",
                        "payload": "HOW_IT_WORKS"
                      },
                      {
                        "type": "postback",
                        "title": "Appeler",
                        "payload": "CALL"
                      }
                    ]
                  }
                ]
              }
            }
          }
        })
      }


      reject()
      return
    })

    return promise

  }
}

function validateEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

export default new GettingStarted()
