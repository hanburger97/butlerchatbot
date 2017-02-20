import Collection from '/imports/lib/Collection'
import Model from '/imports/lib/Model'

class Orders extends Collection {
  constructor() {
    super('orders', Order);
  }

}

class Order extends Model {
  constructor() {
    super(ordersCollection)
  }

  get status () {
    if (this.canceled_at) {
      return 'canceled'
    }
    if (this.paid_at) {
      return 'paid'
    }
    if (this.payment_link_sent_at) {
      return 'payment_link_sent'
    }
    
    return 'new'
  }
}

const ordersCollection = new Orders()

export default ordersCollection

Albert.Collections.Orders = ordersCollection
