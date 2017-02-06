import Customers from '../customers'

export const create = (query = {}) => (
  Customers.insert(query)
)

export const get = (data = {}) => (
  Customers.findOne(data)
)

