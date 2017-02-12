import stripe from '/imports/lib/stripe'

export const get = (customerId) => {
  return new Promise((resolve, reject) => {
    stripe.customers.retrieve(customerId, function (err, customer) {
      if (err) {
        return reject(err)
      }

      return resolve(customer)
    })
  })

}

export const update = (customerId, data = {}) => {
  return new Promise((resolve, reject) => {
    stripe.customers.update(customerId, data, function (err, customer) {
      if (err) {
        return reject(err)
      }

      return resolve(customer)
    })
  })

}

export const create = (data = {}) => {
  return new Promise((resolve, reject) => {
    stripe.customers.create(data, function (err, customer) {
      if (err) {
        return reject(err)
      }

      return resolve(customer)
    })
  })

}
