import Collection from '/imports/lib/Collection'
import Model from '/imports/lib/Model'

class Rooms extends Collection {
  constructor() {
    super('rooms', Room);
  }

}

class Room extends Model {
  constructor() {
    super(roomsCollection)
  }

}

const roomsCollection = new Rooms()

export default roomsCollection
