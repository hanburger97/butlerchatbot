import Collection from '/imports/lib/Collection'
import Model from '/imports/lib/Model'

class Carts extends Collection {
  constructor() {
    super('carts', Cart);
  }
}

class Cart extends Model {
  constructor() {
    super(cartsCollection)

    this.autosave = true
  }

  getDefaultAttrs() {
    return {'products': []}
  }

  indexOf(productToCheck) {
    for (var i = 0; i < this.products.length; i++) {
      let product = this.products[i]
      if (productToCheck.product_id == product.product_id) {
        return i
      }
    }
    return -1
  }

  addProduct(productToAdd, quantity = 1) {
    let indexOf = this.indexOf({product_id: productToAdd.product_id});
    if (indexOf == -1) {
      this.products.push(Object.assign({}, productToAdd, {quantity}))
      return this._autosave()
    } else {
      return this.updateProduct(productToAdd, this.getQuantityOfProduct(productToAdd) + quantity)
    }

  }

  updateProductId(product_id, quantity) {
    const indexOf = this.indexOf({product_id: product_id})
    if (indexOf !== -1) {
      this.products[indexOf].quantity = quantity
    }
    return this._autosave()

  }

  updateProduct({product_id}, quantity) {
    return this.updateProductId(product_id, quantity)
  }

  removeProduct({product_id}) {
    return this.removeProductId(product_id)
  }

  removeProductId(product_id) {
    const indexOf = this.indexOf({product_id})
    if (indexOf !== -1) {
      this.products.splice(indexOf, 1)
    }
    return this._autosave()
  }

  getQuantityOfProduct({product_id}) {
    const indexOf = this.indexOf({product_id})
    if (indexOf === -1) return 0
    return this.products[indexOf].quantity
  }

  _autosave() {
    const _this = this
    return new Promise((resolve, reject) => {
      if (_this.autosave) {
        return _this.save()
      } else {
        resolve(_this)
      }
    })
  }

}

const cartsCollection = new Carts()

export default cartsCollection
