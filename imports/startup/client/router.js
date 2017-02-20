Accounts.onLogin(function () {
  /* Redirect the user to their destination */
  const redirect = Session.get('redirectAfterLogin')
  if (redirect && redirect !== '/login') {
    Session.set('redirectAfterLogin', null)
    FlowRouter.go(redirect)
  }
})

FlowRouter.route('/charge/:orderId', {
  action: function (params, queryParams) {
    BlazeLayout.render('mainLayout', {content: 'charge'})
  }
});


const adminRoutes = FlowRouter.group({
  prefix: '/admin',
  name: 'admin',
  triggersEnter: [
    (context, redirect) => {
      if (!(Meteor.loggingIn() || Meteor.userId())) {
        const route = FlowRouter.current()
        if (route.route.name !== 'adminLogin') {
          Session.set('redirectAfterLogin', route.path)
          FlowRouter.go('adminLogin')
        }
      } else if (!Meteor.loggingIn() && !Roles.userIsInRole(Meteor.userId(), ['admin'])) {
        console.log(Roles.userIsInRole(Meteor.userId(), ['admin']))
        FlowRouter.go('adminUnauthorized')
      } else {
        // let it go...
      }
    },
    (context, redirect) => {

    }]
});

adminRoutes.route('/', {
  name: 'adminDashboard',
  action: function () {
    BlazeLayout.render('adminLayout', {content: 'AdminDashboard'})
  }
})

adminRoutes.route('/orders/:page?', {
  name: 'adminOrders',
  action: function () {
    BlazeLayout.render('adminLayout', {content: 'AdminOrders'})
  }
})

// handling /admin route
adminRoutes.route('/login', {
  name: 'adminLogin',
  action: function () {
    BlazeLayout.render('emptyLayout', {content: 'AdminLogin'})
  }
})

adminRoutes.route('/unauthorized', {
  name: 'adminUnauthorized',
  action: function () {
    BlazeLayout.render('emptyLayout', {content: 'AdminUnauthorized'})
  }
})
