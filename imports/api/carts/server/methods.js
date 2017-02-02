"use strict";
import Carts from './Cart'

export const create = (customerId) => {
  if (!customerId) {
    throw new Meteor.Error('500', 'MISSING PARAM customerId')
  }
  return Carts.insert({customer_id: customerId})
}

export const get = (id) => {
  return Carts.findOne(id)
}
