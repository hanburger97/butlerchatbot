import BaseAction from './BaseAction'
import {ProductAddToCart} from './index'
const SHOW_MANUCURE = '//SHOW_MANUCURE/'

import {list as listProduct, count as countProduct} from '/imports/api/products/server/methods'

export default class ServiceViewManucure extends BaseAction {
  static getActionPostback(query = {}) {
    return SHOW_MANUCURE + JSON.stringify(query, null, 0)
  }
  canHandlePostback(postBack){
    return postBack.indexOf(SHOW_MANUCURE) == 0
  }
  handle({payload, reply, senderId, customer, queryUrl}){
    let query = queryUrl.substring(SHOW_MANUCURE.length)
    if (query){
      query = JSON.parse(query)
    }
    return listProduct(query)
     .then((manucures) => {
       const elements = []
       manucures.forEach( manucure => {
         manucure.variants.forEach( variant => {
           elements.push({
             content_type: 'text',
             title: `${variant.title} ${variant.price}`,
             payload: ProductAddToCart.getActionPostback(manucure.id, {variantId:variant.id, quantity: 1})
           })
         })

       })
       return reply({
         message: {
           text: "Veuillez commencer par choisir le service voulu. Nous aurons l'occasion de confirmer  plus de détails plus tard.",
           quick_replis:elements
         }
       })
     })
  }
}