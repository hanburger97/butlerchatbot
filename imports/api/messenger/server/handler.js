import Bot from './Bot'

Bot.on('message', (payload, reply) => {
  console.log(payload)
  reply({message: {text: 'hey'}})
})
