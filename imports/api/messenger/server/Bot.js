import Bot from './FBMessenger'
import {ProductShowCart} from './modules/actions'

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
    "type": "postback",
    "title": "Menu principal",
    "payload": "START"
  },
  {
    "type":"postback",
    "title": "Voir les services",
    "payload": "SERVICES"
  },
  {
    "type": "postback",
    "title": "Voir mon panier",
    "payload": ProductShowCart.getActionPostback()
  }
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
