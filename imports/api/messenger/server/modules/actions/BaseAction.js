export default class BaseAction {

  static getActionPostback(data) {
    return ''
  }

  canHandlePostback(postBack) {
    return false
  }

  handle() {

  }
}
