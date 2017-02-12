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

}

const ordersCollection = new Orders()

export default ordersCollection

Albert.Collections.Orders = ordersCollection
