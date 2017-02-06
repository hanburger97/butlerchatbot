import {BaseAction} from './'
const PRODUCTS_CONFIRM_ORDER = 'PRODUCTS_CONFIRM_ORDER'

export default class ProductConfirmOrder extends BaseAction {

  static getActionPostback() {
    return PRODUCTS_CONFIRM_ORDER
  }

  canHandlePostback(postBack) {
    return postBack.indexOf(PRODUCTS_CONFIRM_ORDER) == 0
  }

  handle({payload, reply, senderId, customer, queryUrl}) {

  }
}
