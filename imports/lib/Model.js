import Collection from './Collection'

class Model {
  constructor(collection) {
    if (!(collection instanceof Collection)) {
      throw new Meteor.Error('INSTANCE_ERROR', 'Instance passed must be of type Collection')
    }

    this._collection = collection
    this._attrs = {}
  }

  get id () {
    return this._attrs['_id']
  }

  set(attrName, value) {
    if (this._attrs[attrName] === undefined) {
      defineSetterGetter(this, attrName)
    }
    this._attrs[attrName] = value
  }

  setAttrs(attrs) {
    const _this = this
    this._attrs = attrs
    Object.keys(attrs).forEach(function (attrName) {
      defineSetterGetter(_this, attrName)
    })
  }

  save() {
    const _this = this
    const promise = new Promise((resolve, reject) => {
      const updated = this._collection.update(this._id, {$set: this._attrs})
      if (updated) {
        resolve(_this)
      } else {
        reject(new Meteor.Error('NOT_FOUND', updated))
      }

    })

    return promise
  }
}

const defineSetterGetter = (model, attrName) => {

  if (model[attrName] !== undefined) return // attribute already configured

  Object.defineProperty(model, attrName, {
    get: function () {
      return model._attrs[attrName]
    },
    set: function (value) {
      model._attrs[attrName] = value
    }
  })
}

export default Model
