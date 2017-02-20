import {Email} from 'meteor/email'
import Orders from '../orders'
import Customers from '/imports/api/customers/customers'


Meteor.methods({
  'orders.sendPaymentEmailToClient': function (orderId) {
    console.log(orderId)
    Orders.findOne({_id: orderId})
      .then(order => {
        return Customers.findOne({_id: order.customer_id})
          .then(customer => {
            Email.send({
              to: customer.email,
              from: "Concierge Albert <conciergealbert@elicng.com>",
              subject: `Lien de paiement ${order.data.name}`,
              html: `Bonjour ${customer.metadata.first_name},
                    <br /><br />
                     La commande ${order.data.name} a été livrée à votre porte.
                     <br /><br />
                     Veuillez <a href="${Meteor.absoluteUrl()}charge/${order._id}">cliquer ici</a> pour payer votre commande.
                    <br /><br />
                    Merci et bonne journée`,
            });
          })
          .then(() => {
            return order
          })
      })
      .then(order => {

        order.set('payment_link_sent_at', new Date())
        order.save()
      })


  }
})
