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
  }

  getCart() {
    return getCart(this.cart_id)
  }

  createCart () {
    const _this = this
    return createCart()
      .then(cart => {
        _this.set('cart_id', cart.id)
        _this.save()
        return cart
      })
  }
}



const customersCollection = new Customers()

export default customersCollection
