import Collection from '/imports/lib/Collection'
import Model from '/imports/lib/Model'
import {get as getCart, create as createCart} from '/imports/api/carts/server/methods'
import {get as getShopifyAddresses} from '/imports/api/shopify/server/customer_address'
import {get as getStripeCustomer, create as createStripeCustomer} from '/imports/api/stripe/customers'


class Customers extends Collection {
  constructor() {
    super('customers', Customer);
  }

}

class Customer extends Model {
  constructor() {
    super(customersCollection)
    this.set('cart', [])
  }

  getCart() {
    const _this = this
    return getCart(_this.cart_id)
      .catch(err => {
        return createCart(_this._id)
          .then(cartId => {
            _this.set('cart_id', cartId)
            _this.save()
            return this.getCart()
          })
      })
  }
  clearCart() {
    const _this = this
    _this.cart_id = null
    _this.save()
  }

  getAddresses() {
    const _this = this
    return getShopifyAddresses(_this.shopify.id)
  }

  getStripeCustomer() {
    if (this.stripe_customer_id)
      return getStripeCustomer(this.stripe_customer_id)

    const self = this
    // not yet a stripe customer
    return createStripeCustomer({email: this.email})
      .then(stripeCustomer => {
        self.set('stripe_customer_id', stripeCustomer.id)
        self.save()
        return stripeCustomer
      })
  }

}


const customersCollection = new Customers()

export default customersCollection
