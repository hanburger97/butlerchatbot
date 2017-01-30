import {BaseHandler} from './handlers'

class ProductHandler extends BaseHandler {
  constructor() {
    super()
  }

  handle({payload, reply, senderId, customer}) {
    const promise = new Promise(() => {
      import {list as listProduct, count as countProducts} from '/imports/api/products/server/methods'
      const postbackurl = payload.postback.payload
      let SHOW_PRODUCTS = '//SHOW_PRODUCTS/'
      let PRODUCT_ADD_TO_CART = '//PRODUCT_ADD_TO_CART/'

      if (postbackurl.indexOf(SHOW_PRODUCTS) == 0) {

        let query = postbackurl.substring(SHOW_PRODUCTS.length)
        if (query) {
          query = JSON.parse(query)
        }

        return countProducts(query)
          .then((count) => {
            if (query['page'] === undefined)
              query['page'] = 1

            if (query['limit'] === undefined)
              query['limit'] = 9

            return listProduct(query)
              .then((products) => {
                if (products.length == 0) {
                  reply({message: {text: "Il n'y a pas de produit chez ce marchand."}})
                } else {

                  const elements = []

                  products.forEach((product) => {
                    elements.push({
                      title: product.title,
                      image_url: product.image ? product.image.src : "https://placehold.it/200x100",
                      subtitle: product.body_html,
                      buttons: [{
                        type: "postback",
                        title: "Ajouter à mon panier",
                        payload: "//PRODUCT_ADD_TO_CART/" +
                        JSON.stringify(
                          product.variants[0],
                          null, 0
                        )
                      }]
                    })
                  })

                  if (count > (query.page * query.limit)) {
                    let viewMorePayload = Object.assign({}, query, {page: query.page + 1})
                    elements.push({
                      title: `Page ${query.page} sur ${Math.ceil(count / query.limit)}`,
                      buttons: [{
                        type: "postback",
                        title: "Prochaine page",
                        payload: SHOW_PRODUCTS + JSON.stringify(viewMorePayload, null, 0)
                      }]
                    })
                  }

                  reply({
                    "message": {
                      "attachment": {
                        "type": "template",
                        "payload": {
                          "template_type": "generic",
                          "elements": elements
                        }
                      }
                    }
                  })


                }
              })
          })
          .catch((err) => {

            console.log(error)
            throw err
          })

      }
      else if (postbackurl.indexOf(PRODUCT_ADD_TO_CART) == 0) {


        let query = postbackurl.substring(PRODUCT_ADD_TO_CART.length)
        if (query) {
          query = JSON.parse(query)
        }

        return customer.getCart()
          .catch(err => {
            return customer.createCart()
          })
          .then(cart => {

            return cart.addProduct(query)
              .then(cart => {
                import {get as getProduct} from '/imports/api/products/server/methods'
                getProduct(query.product_id)
                  .then((product) => {
                    reply({
                      message: {
                        "attachment": {
                          "type": "template",
                          "payload": {
                            "template_type": "button",
                            "text": `${product.title} a été ajouté à votre panier.`,
                            "buttons": [
                              {
                                "type": "web_url",
                                "url": cart.checkoutUrl,
                                "title": "Voir mon panier",
                                "webview_height_ratio": "full"
                              }
                            ]
                          }
                        }
                      }
                    })
                  })
                return cart
              })
          })


      }
    })


    return promise

  }
}

export default new ProductHandler()
