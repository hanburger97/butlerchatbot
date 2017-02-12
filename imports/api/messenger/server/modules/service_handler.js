import {BaseHandler} from './base_handler'
import {ServiceViewMassages} from './actions'


class ServiceHandler extends BaseHandler {
  constructor(){
    super()
    this.action = [
     new ServiceViewMassages()
    ]


  }
  handle({payload, reply, senderId, customer, queryUrl}){
    const _this = this
    const promise = new Promise((resolve, reject) => {
      let handler = null
      _this.action.forEach(action => {
        if (action.canHandlePostback(queryUrl)) {
          handler = action.handle({payload, reply, senderId, customer, queryUrl})
        }
      })
      console.log(handler)
      if (handler) return handler
      reject()

    })
    return promise
  }
}
export default new ServiceHandler()