import './adminLogin.html'

Template.AdminLogin.onCreated(function () {
  
})

Template.AdminLogin.events({
  'submit #adminLoginForm' (event) {
    event.preventDefault();
    
    const form = event.target
    const email = form.email.value
    const password = form.password.value
    
    Meteor.loginWithPassword(email, password, function callback (err, success) {
      if (!err) {
        FlowRouter.go('adminDashboard')
      } else {
        alert('Erreur : ' + err.reason)
      }
    })
  }
})
