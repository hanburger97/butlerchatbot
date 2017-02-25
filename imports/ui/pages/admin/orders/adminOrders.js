import './adminOrders.html'
import Orders from '/imports/api/orders/orders'
import { Email } from 'meteor/email'

const LIMIT = 10

Template.AdminOrders.onCreated(function () {
  const _this = this
  let subscription 
  _this.autorun(function () {
    FlowRouter.watchPathChange()
    var currentPage = parseInt(FlowRouter.getParam('page')) || 1
    if (subscription) {
      subscription.stop()
    }
    subscription = _this.subscribe('orders', {page: currentPage, limit: LIMIT})

  })
})

Template.AdminOrders.helpers({
  orders() {
    return Orders.find()
  },
  previousPages: function () {
    const currentPage = parseInt(FlowRouter.getParam('page')) || 1
    const pages = []
    for (var i = currentPage -1; i >= 1 && i >= currentPage - 3; i--) {
      pages.unshift(i)
    }
    return pages
  },
  nextPages: function () {
    const currentPage = parseInt(FlowRouter.getParam('page')) || 1
    const pages = []

    
    const ordersCount = Counts.get('ordersCount')
    
    const totalPageCount = Math.ceil(ordersCount / LIMIT)
    for (var i = currentPage + 1; i <= totalPageCount && i <= currentPage + 3; i++) {
      pages.push(i)
    }
    return pages
  },
  highestPage: function () {
    const ordersCount = Counts.get('ordersCount')
    const totalPageCount = Math.ceil(ordersCount / LIMIT)
    return totalPageCount
  },
  currentPage: function () {
    return parseInt(FlowRouter.getParam('page')) || 1
  }
})

Template.AdminOrders.events({
  'click #asd': function (event) {
    event.preventDefault()
    Meteor.call('orders.sendPaymentEmailToClient', this._id)
  }
})
