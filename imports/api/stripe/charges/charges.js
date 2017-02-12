import Collection from '/imports/lib/Collection'
import Model from '/imports/lib/Model'

class Charges extends Collection {
  constructor() {
    super('stripe.charges', Charges);
  }

}

class Charge extends Model {
  constructor() {
    super(chargesCollection)
  }

}

const chargesCollection = new Charges()

export default chargesCollection

Albert.Collections.Charges = chargesCollection
