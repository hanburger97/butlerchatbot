import stripe from '/imports/lib/stripe'

export const create = (data = {}) => {
  return new Promise((resolve, reject) => {
    stripe.charges.create(data, function (err, charge) {
      if (err) return reject(err)
      return resolve(charge)
    });
  })
}
