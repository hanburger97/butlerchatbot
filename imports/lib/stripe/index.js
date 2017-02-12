import stripe from 'stripe'

export default stripe.Stripe(Meteor.settings.private.stripe.secret_key)
