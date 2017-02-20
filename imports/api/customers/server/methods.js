import Customers from '../customers'

export const create = (query = {}) => (
  Customers.insert(query)
)

export const get = (data = {}) => (
  Customers.findOne(data)
)

Meteor.methods({
  'Customers.get': function (_id) {
    var customer = Customers.parentFindOne(_id)
    if (!customer) return null;
    
    return customer._attrs
  }
})
