import './charge.html'
import Orders from '/imports/api/orders/orders'
const paying = new ReactiveVar(false)

function getOrderId() {
  return FlowRouter.getParam('orderId');
}

Template.charge.onCreated(function () {
  const _this = this
  _this.autorun(function () {

    const orderId = getOrderId()

    _this.subscribe('singleOrder', orderId)

  })
})

Template.chargePresenter.onRendered(function () {
  $('#card-number').on('keypress change', function () {
    $(this).val(function (index, value) {
      return value.replace(/\W/gi, '').replace(/(.{4})/g, '$1 ');
    });
  });

})


Template.charge.helpers({
  order: function () {
    return Orders.parentFindOne(getOrderId())
  },
  paying: function () {
    return paying.get()
  }
})

let parsley = null
Template.chargePresenter.events({
  'submit #payment-form': function (event) {
    event.preventDefault()

    const order = this.order

    Stripe.card.createToken({
      number: $('#card-number').val(),
      cvc: $('#card-cvc').val(),
      exp_month: $('#card-exp-month').val(),
      exp_year: $('#card-exp-year').val()
    }, function (status, response) {
      if (response.error) {
        alert(response.error.message)
      } else {
        paying.set(true)
        Meteor.call('charge', {orderId: order._id, tokenId: response.id}, function (err, promise){
          console.log(arguments)
          promise
            .then(response => {
              console.log(response)
            })
            .catch(err => {
              alert(err)
              console.log(err)
              paying.set(false)
            })

        })
      }

    });
    return false
  }
})

