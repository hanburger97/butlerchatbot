Template.registerHelper('settings', function (path) {
  import _ from 'lodash'
  return _.get(Meteor.settings, path)
})

import {stripeAmount} from './stripe'
/**
 * Stripe accepts total in cents. Multiply the value to cents.
 */
Template.registerHelper('stripeAmount', function (amount) {
  return stripeAmount(amount)
})

/**
 * Get a list of expiration years for the few next years
 */
Template.registerHelper('expYears', function () {
  const currentYear = new Date().getFullYear()

  const years = []
  for (var i = 0; i <= 10; i++) {
    years.push(currentYear + i)
  }
  return years
})


/**
 * Date formats
 */
import {getShortFormat} from '/imports/lib/utils/dateFormat'
Template.registerHelper('shortDate', function (date) {
  return getShortFormat(date)
})
