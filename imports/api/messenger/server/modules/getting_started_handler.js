import {BaseHandler} from './base_handler'
const GETTING_STARTED = 'GETTING_STARTED'

class GettingStarted extends BaseHandler {

  handle({payload, reply, senderId, customer, queryUrl}) {

    const promise = new Promise((resolve, reject) => {
      if (queryUrl.toLowerCase() !== 'start'){
        reject()
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
    })

    return promise

  }
}

export default new GettingStarted()
