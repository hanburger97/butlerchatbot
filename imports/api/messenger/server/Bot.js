import Bot from './FBMessenger'

let bot = new Bot({
  token: Meteor.settings.private.facebook.messenger.page_access_token,
  verify: 'testbot_verify_token'
})

console.log('Bot::Init')

bot.setGetStartedButton([
  {
    "payload": "start"
  }
], (error, response) => {
  if (error) {
    console.log('Bot::setGetStartedButton::ERRORED', error)
  } else {
    console.log('Bot::setGetStartedButton::Finished', response)
  }
})

bot.setPersistentMenu([
  {
    "type":"postback",
    "title":"Voir services",
    "payload":"START"
  },
  {
    "type":"postback",
    "title":"Aide",
    "payload":"help"
  },
  /*{
    "type":"web_url",
    "title":"Checkout",
    "url":"http://petersapparel.parseapp.com/checkout",
    "webview_height_ratio": "full",
    "messenger_extensions": true
  }*/
], (error, response) => {
  if (error) {
    console.log('Bot::setPersistentMenu::ERRORED', error)
  } else {
    console.log('Bot::setPersistentMenu::Finished', response)
  }
})

bot.setGreeting("Bonjour {{user_first_name}}, bienvenue à Albert.", (error, response) => {
  if (error) {
    console.log('Bot::setGreeting::ERRORED', error)
  } else {
    console.log('Bot::setGreeting::Finished', response)
  }
})

export default bot
