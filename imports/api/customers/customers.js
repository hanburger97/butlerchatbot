import Collection from '/imports/lib/Collection'
import Model from '/imports/lib/Model'
import {get as getCart, create as createCart} from '/imports/api/carts/server/methods'

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
    return getCart(this.cart_id)
  }

  createCart () {
    const _this = this
    return createCart(this._id)
      .then(cartId => {
        _this.set('cart_id', cartId)
        _this.save()
        return this.getCart()
      })
  }
}



const customersCollection = new Customers()

export default customersCollection
