import Collection from '/imports/lib/Collection'
import Model from '/imports/lib/Model'

class Responses extends Collection {
  constructor() {
    super('responses', Response);
  }

}

class Response extends Model {
  constructor() {
    super(responsesCollection)
  }

}



const responsesCollection = new Responses()

export default responsesCollection
