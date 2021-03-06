/**
 * Based on :
 * https://shopify.github.io/js-buy-sdk/api/classes/CartModel.html
 * */

class Cart {
  constructor(shopifyCart) {
    this.shopifyCart = shopifyCart
  }

  addProductVariant (variant, quantity = 1) {
    const _this = this
    return this.shopifyCart.createLineItemsFromVariants({variant: Object.assign({GUID_KEY}, variant, quantity})
      .then(shopifyCartModel => {
        console.log(shopifyCartModel)
        return _this
      })
  }

  updateVariantQuantity (variantId, quantity) {
    const _this = this
    return this.shopifyCart.updateLineItem(variantId, quantity)
      .then(shopifyCartModel => {
        return _this
      })
  }

  removeProductId (productId) {
    const _this = this
    return this.shopifyCart.removeLineItem(productId)
      .then(shopifyCartModel => _this)
  }

  removeProductVariant (product) {
    return this.removeProductId(product.id)
  }

  clearAllVariants () {
    const _this = this
    return this.shopifyCart.clearLineItems()
      .then(shopifyCartModel => _this)
  }

  get id () {
    return this.shopifyCart.id
  }

  get checkoutUrl () {
    return this.shopifyCart.checkoutUrl
  }

}

export default Cart
