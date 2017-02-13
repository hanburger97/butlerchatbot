import {BaseAction, ProductUpdateQuantity, ProductShowCart} from './index'
const PRODUCT_ADD_TO_CART = '//PRODUCTS/CART/ADD_TO_CART/'
import {get2 as getProduct2} from '/imports/api/products/server/methods'

export default class ProductAddToCart extends BaseAction {

  static getActionPostback(productId, options = {}) {
    const {quantity, variantId} = options
    let data = {product_id: productId}

    if (quantity) {
      data.quantity = quantity
    }

    if (variantId) {
      data.variant_id = variantId
    }
    return PRODUCT_ADD_TO_CART + JSON.stringify(data)
  }

  canHandlePostback(postBack) {
    return postBack.indexOf(PRODUCT_ADD_TO_CART) == 0
  }

  handle({payload, reply, senderId, customer, queryUrl}) {

    //let productId
    let query = queryUrl.substring(PRODUCT_ADD_TO_CART.length)

    if (query) {
      //productId = JSON.parse(query).product_id
      query = JSON.parse(query)
      if (!query.product_id){
        throw new Meteor.Error('MISSING_PARAM','Missing parameter product_id')
      }
    }
    const productId = query.product_id
    const variantId = query.variant_id
    const quantity = query.quantity
    //const type = query.vendor

    if (quantity && quantity != 0){
      return getProduct2(productId)
          .then(product => {
            console.log(product)
            return customer.getCart()
                .then(cart => {

                  if (variantId) {
                    let variant = null

                    for (var i = 0; i < product.variants.length; i++) {
                      const v = product.variants[i]
                      if (v.id = variantId){
                        variant = v
                        break
                      }
                    }
                    product.variants = [variant]
                  }
                  cart.addProduct(product, quantity)
                  var msg = {
                    message: {
                      "text": `(${quantity}) ${product.title} a/ont été ajouté à votre panier.`,
                      "quick_replies": [
                        {
                          "content_type": "text",
                          "title": "Voir mon panier",
                          "payload": ProductShowCart.getActionPostback(),

                        }

                      ]
                    }
                  }
                  if (product.vendor == 'Massage'){
                    msg.message.text = `${customer.metadata.first_name}, voulez-vous confirmer votre choix de "${product.title}"?`
                    msg.message.quick_replies = [
                     {
                      content_type:'text',
                      title: 'Oui',
                      payload: 'MASSAGE_TIME'
                    },{
                      content_type: 'text',
                      title:'Voir thérapeutes',
                      payload: 'MASSAGE_THERAPEUTES'
                    },{
                      content_type: 'text',
                      title:'Retour aux massages',
                      payload: '//SHOW_MASSAGES/{"vendor":"Massage"}'
                    }]
                  }
                  return reply(msg)
                })
          })
       .catch(err => {

         console.log(err)
       })
    }
    else{
      return reply({
        message: {
          text: "Veuillez choisir la quantité que vous voulez",
          "quick_replies": [
            {
              "content_type": "text",
              "title": "Canceler",
              "payload": 'Épicerie fine',
            },
            {
              "content_type": "text",
              "title": "1",
              "payload": ProductAddToCart.getActionPostback(productId, {quantity:1}),
            },
            {
              "content_type": "text",
              "title": "2",
              "payload": ProductAddToCart.getActionPostback(productId, {quantity:2}),
            },
            {
              "content_type": "text",
              "title": "3",
              "payload": ProductAddToCart.getActionPostback(productId, {quantity:3}),
            },
            {
              "content_type": "text",
              "title": "4",
              "payload": ProductAddToCart.getActionPostback(productId, {quantity:4}),
            },
            {
              "content_type": "text",
              "title": "5",
              "payload": ProductAddToCart.getActionPostback(productId, {quantity:5}),
            },
            {
              "content_type": "text",
              "title": "6",
              "payload": ProductAddToCart.getActionPostback(productId, {quantity: 6})
            },
            {
              "content_type": "text",
              "title": "7",
              "payload": ProductAddToCart.getActionPostback(productId, {quantity:7}),
            },
            {
              "content_type": "text",
              "title": "8",
              "payload": ProductAddToCart.getActionPostback(productId, {quantity:8}),
            },
            {
              "content_type": "text",
              "title": "9",
              "payload": ProductAddToCart.getActionPostback(productId, {quantity:9}),
            },
            {
              "content_type": "text",
              "title": "10",
              "payload": ProductAddToCart.getActionPostback(productId, {quantity:10}),
            },
          ]
        }
      })
    }







  }
}
