import Bot from './FBMessenger'

let bot = new Bot({
  token: Meteor.settings.private.facebook.messenger.page_access_token,
  verify: 'testbot_verify_token'
})

export default bot
