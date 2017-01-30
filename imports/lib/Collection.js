class Collection extends Mongo.Collection {

  constructor(name, modelClass) {
    const transform = (doc) => {
      // extend a customer class with more functions
      const modelInstance = new modelClass

      modelInstance.setAttrs(doc)
      return modelInstance
    }

    super(name, {transform})
    this.parentInsert = this.insert
    this.insert = promisify(this.insert)

    this.parentupdate = this.update
    this.update = promisify(this.update)

    this.parentupsert = this.upsert
    this.upsert = promisify(this.upsert)

    this.parentremove = this.remove
    this.remove = promisify(this.remove)

    this.parentFindOne = this.findOne

    this.findOne = this.findOnePromise
  }

  findOnePromise() {

    const args = arguments

    const promisify =  ((resolve, reject) => {
      const found = this.parentFindOne.apply(this, args)
      if (found) {
        resolve(found)
      } else {
        reject(new Meteor.Error(
          'NOT_FOUND',
          '404: Not found',
          `Document with selector ${args[0]} could not be found in the collection ${this._name}`)
        )
      }
    }).bind(this)

    const promise = new Promise(promisify)

    return promise
  }

}

const promisify = (func) => {
  return function () {
    const _this = this
    const args = Array.prototype.slice.call(arguments);

    return new Promise((resolve, reject) => {
      args.push((err, result) => {
        if (err) {
          reject(err)
        } else {
          resolve(result);
        }
      })

      func.apply(_this, args)
    })
  }

}

export default Collection