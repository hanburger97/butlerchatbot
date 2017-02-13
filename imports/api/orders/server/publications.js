import Orders from '../orders'

Meteor.publish('singleOrder', function (orderId) {
  return Orders.find({'_id': orderId})
})
