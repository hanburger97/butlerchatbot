import Collection from '/imports/lib/Collection'
import Model from '/imports/lib/Model'

class Postbacks extends Collection {
  constructor() {
    super('postbacks', Postback);
  }
}

class Postback extends Model {
  constructor() {
    super(postbacksCollection)
  }

}

const postbacksCollection = new Postbacks()

export default postbacksCollection
