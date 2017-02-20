import Customers from '../customers'

export const create = (query = {}) => (
  Customers.insert(query)
)

export const get = (data = {}) => (
  Customers.findOne(data)
)

Meteor.methods({
  'Customers.get': function (_id) {
    var custeomr = Customers.parentFindOne(_id) 
    return custeomr._attrs
  }
})
