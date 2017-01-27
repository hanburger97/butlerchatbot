import Bot from './Bot'

Bot.on('message', (payload, reply) => {
  console.log(payload)
  reply({
    message: {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "button",
          "text": "What do you want to do next?",
          "buttons": [
            {
              "type": "web_url",
              "url": "https://petersapparel.parseapp.com",
              "title": "Show Website"
            },
            {
              "type": "postback",
              "title": "Alexis le gourmand",
              "payload": '//SHOW_PRODUCTS/{"vendor":"Alexis le gourmand"}',
            },
            {
              "type": "postback",
              "title": "Boulangerie du coin",
              "payload": '//SHOW_PRODUCTS/{"vendor":"Boulangerie du coin"}',
            }
          ]
        }
      }
    }
  })
})


import {list as listProduct} from '/imports/api/products/server/methods'

Bot.on('postback', (payload, reply) => {
  const postbackurl = payload.postback.payload;

  let SHOW_PRODUCTS = '//SHOW_PRODUCTS/';
  if (postbackurl.indexOf(SHOW_PRODUCTS) == 0) {

    let query = postbackurl.substring(SHOW_PRODUCTS.length)
    if (query) {
      query = JSON.parse(query)
    }

    listProduct(query)
      .then((products) => {
        const product = products[0]
        reply({
          "message": {
            "attachment": {
              "type": "template",
              "payload": {
                "template_type": "generic",
                "elements": [
                  {
                    "title": product.title,
                    "image_url": product.image ? product.image.src : "https://placehold.it/300",
                    "subtitle": product.body_html,
                  }
                ]
              }
            }
          }
        })
      })

  }
})