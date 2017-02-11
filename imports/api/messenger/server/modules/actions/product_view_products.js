import BaseAction from './BaseAction'
import ProductUpdateQuantity from './product_update_quantity'
import {ProductAddToCart} from './index'
const SHOW_PRODUCTS = '//SHOW_PRODUCTS/'

import {list as listProduct, count as countProducts} from '/imports/api/products/server/methods'

export default class ProductViewProducts extends BaseAction {

  static getActionPostback(query = {}) {
    return SHOW_PRODUCTS + JSON.stringify(query, null, 0)
  }

  canHandlePostback(postBack) {
    return postBack.indexOf(SHOW_PRODUCTS) == 0
  }

  handle({payload, reply, senderId, customer, queryUrl}) {
    let query = queryUrl.substring(SHOW_PRODUCTS.length)
    if (query) {
      query = JSON.parse(query)
    }

    return countProducts(query)
      .then((count) => {
        console.log(query)
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
                let subtitle = product.body_html
                subtitle = subtitle.replace('<p>', '')
                subtitle = subtitle.replace('</p>', '')

                elements.push({
                  title: `${product.title} - (${product.variants[0].price}$)`,
                  image_url: product.image ? product.image.src : "https://placehold.it/100x75",
                  subtitle: subtitle,
                  buttons: [{
                    type: "postback",
                    title: "Ajouter à mon panier",
                    payload: ProductAddToCart.getActionPostback(product.id)
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
                    payload: ProductViewProducts.getActionPostback(viewMorePayload)
                  }]
                })
              }

              return reply({
                "message": {
                  "attachment": {
                    "type": "template",
                    "payload": {
                      "template_type": "generic",
                      "elements": elements
                    }
                  },
                  "quick_replies":[
                    {
                      "content_type":"text",
                      "title":"Retour au menu",
                      "payload":"SERVICE"
                    },
                    {
                      "content_type":"text",
                      "title":"Continuer Epicerie",
                      "payload":"Épicerie fine"
                    },
                    {
                      "content_type":"text",
                      "title":"Voir mon panier",
                      "payload":"//SHOW_CART/"
                    }
                  ]
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
}