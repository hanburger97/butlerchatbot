import BaseAction from './BaseAction'
import {ProductAddToCart} from './index'
const SHOW_MASSAGES = '//SHOW_MASSAGES/'

import {list as listProduct, count as countProducts} from '/imports/api/products/server/methods'

export default class ServiceViewMassages extends BaseAction {
  static getActionPostback(query = {}) {
    return SHOW_MASSAGES + JSON.stringify(query, null, 0)
  }
  canHandlePostback(postBack){
    return postBack.indexOf(SHOW_MASSAGES) == 0
  }
  handle({payload, reply, senderId, customer, queryUrl}){
    let query = queryUrl.substring(SHOW_MASSAGES.length)
    if (query) {
      query = JSON.parse(query)
    }
    return listProduct(query)
     .then((massages) => {
       const elements = []
       massages.forEach( massage => {
         let subtitle = massage.body_html
         subtitle = subtitle.replace('<p>', '')
         subtitle = subtitle.replace('</p>', '')
         elements.push({
           title: `${massage.title}`,
           subtitle: subtitle,
           image_url: massage.image ? massage.image.src : 'https://placehold.it/100x75',
           buttons: [
             {
               type:'postback',
               title: `${massage.variants[0].title} minutes (${massage.variants[0].price})`,
               payload: ProductAddToCart.getActionPostback(massage.id, {variantId:massage.variants[0].id, quantity:1})
             },
             {
               type: 'postback',
               title: `${massage.variants[1].title} minutes (${massage.variants[1].price})`,
               payload: ProductAddToCart.getActionPostback(massage.id, {variantId:massage.variants[1].id, quantity:1})
             }
           ]
         })


       })
       return reply({
         message: {
           attachment: {
             type: "template",
             payload: {
               template_type: "generic",
               elements: elements
             }
           },
           quick_replies:[
             {
               content_type:"text",
               title:"Retour au menu",
               payload:"SERVICE"
             },
             {
               content_type:"text",
               title:"Voir mon panier",
               payload:"//SHOW_CART/"
             }
           ]
         }
       })

     }).catch( err => {
       console.log(err)
       throw err
     })
  }

}