import Orders from '../orders'

Meteor.publish('singleOrder', function (orderId) {
  return Orders.find({'_id': orderId})
})

Meteor.publish('orders', function ({page = 1, limit = 10}) {
  if (Roles.userIsInRole(this.userId, ['admin'])) {

    Counts.publish(this, 'ordersCount', Orders.find(), {
      noReady: true
    });
    
    return Orders.find({}, {limit, skip: limit * (page - 1), sort: {created_at: -1}});
    
    

  } else {

    // user not authorized. do not publish secrets
    this.stop();
    return;

  }
});
