import {BaseHandler} from './handlers'
import Responses from '/imports/api/messenger/Responses'
import Postbacks from '/imports/api/messenger/Postbacks'
import Rooms from '/imports/api/rooms/Rooms'

class DefaultModule extends BaseHandler {
  constructor() {
    super()
    this.pausedUsers = []
    this.recordRoom = []
    this.recordParking = []
    this.stopAutoReply = false //When True, bot will not answer when message is undefined
  }

  handle({payload, reply, senderId, customer}) {
    const _this = this
    const promise = new Promise(() => {

      /*** TIMEOUT SECTION **/
      if (_this.pausedUsers[senderId] && _this.pausedUsers[senderId] > new Date()) {
        payload.message.text = '';
        return
      }

      /***Recording + Update Room for specific user**/
      else if (_this.recordRoom[senderId] && _this.recordRoom[senderId] == 'Yes') {
        payload.message.text = Number(payload.message.text);
        customer.set('room', payload.message.text)

        return customer.save()
          .then(() => {
            _this.stopAutoReply = true;
            delete _this.recordRoom[senderId];
            reply({
              message: {
                attachment: {
                  type: "template",
                  payload: {
                    template_type: "button",
                    text: "Votre numéro de porte a été enregistré.",
                    buttons: [
                      {
                        type: "postback",
                        title: "Continuer",
                        payload: "ENTRETIEN_PROCEED"
                      }
                    ]
                  }
                }
              }
            });
          })
          .catch(err => {
            console.log(err)
          })

      } else if (_this.recordParking[senderId] && _this.recordParking[senderId] == 'Yes') {

        User.findOneAndUpdate({id: JSON.stringify(senderId)}, {
          parking: payload.message.text
        }, function (error) {
          if (error) {
            console.log(error)
          }
          reply({
            'text': 'Parfait! Vous pouvez continuer', quick_replies: [
              {
                content_type: text,
                title: "Continuer",
                payload: "CARWASH_PROCEED"
              }
            ]
          });
          _this.stopAutoReply = true;
          delete _this.recordParking[senderId];
        })
      }
      /**Expired Timeout section**/
      else {
        delete _this.pausedUsers[senderId]
      }
      /*******************/


      if (payload.message && payload.message.quick_reply) {
        console.log('In quickreply elif');
        Postbacks.findOne({trigger: payload.message.quick_reply.payload}).then(postback => {

          if (postback.action && postback.action.operation == 'RecordDay') {
            customer.set('service', {
              day: postback.action.value
            })
            customer.save()
            reply({message: postback.response})


          } else if (postback.action && postback.action.operation == 'AddDetail') {
            customer.set('detail', postback.action.value)
            customer.save()
            reply({message: postback.response})


          } else if (postback.action && postback.action.operation == 'ConfirmService') {
            reply({message: {'text': 'Parfait'}})

          } else {
            reply({message: postback.response})

          }
        })
          .catch(err => {
            reply({
              message: {
                text: "Désolé je n'ai pas compris votre demande, voulez-vous parler à un humain?", quick_replies: [

                  {
                    content_type: "text",
                    title: "Oui",
                    payload: "HUMAN"
                  },
                  {
                    content_type: "text",
                    title: "Retour au Menu",
                    payload: "SERVICES"
                  }

                ]
              }
            })
          })
      } else if (payload.message && payload.message.text) {
        payload.message.text = payload.message.text.toLowerCase();
        let words = payload.message.text.split(' ');
        let words2 = payload.message.text.split(' ');
        //console.log(words);

        let r = [];
        for (let z = 0; z < words.length; z++) {
          let word = words[z];
          return Responses.findOne({trigger: word})
            .then((response) => {
              _this.stopAutoReply = false;
              if (response && response.action && response.action.operation == 'Timeout') {
                let until = new Date(new Date().getTime() + (Number(response.action.value) * 1000));
                _this.pausedUsers[senderId] = until;
                reply({message: response.response});
              } else if (data) {
                reply({message: response.response});

              }
            })
            .catch(err => {
              console.log(err.message)
              if (!_this.stopAutoReply) {
                console.log('No data');
                r.push('a');
                console.log("r is " + r);
                console.log('words2 is ' + words2);
                if (r.length == words2.length) {
                  console.log("NO REPLY");
                  reply({
                    message: {
                      text: "Désolé je n'ai pas compris votre demande, voulez-vous parler à un humain?",
                      quick_replies: [
                        {
                          content_type: "text",
                          title: "Oui",
                          payload: "HUMAN"
                        },
                        {
                          content_type: "text",
                          title: "Retour au Menu",
                          payload: "SERVICES"
                        }

                      ]
                    }
                  });
                }
              }
            })

        }

      } else if (payload.postback) {

        Postbacks.findOne({
          trigger: payload.postback.payload
        })
          .then(data => {
            if (!data) {

            } else {

              if (data.action && data.action.operation == 'Timeout') {
                let until = new Date(new Date().getTime() + (Number(data.action.value) * 1000));
                _this.pausedUsers[senderId] = until
              }
              else if (data.action && data.action.operation == 'RecordUser') {
                User.findOneAndUpdate({id: JSON.stringify(senderId)}, {
                  id: JSON.stringify(senderId)
                }, {upsert: true}, function (error) {
                  if (error) {
                    console.log('There was an error registering the user' + error)
                  }
                });
              }
              else if (data.action && data.action.operation == 'AddCart') {
                //AddCart action has to be added to the confirmation msg of each item
                //Check if user already exists else upsert

                customer.cart = result.cart.concat([Number(data.action.value)])
                customer.save()

              } else if (data.action && (data.action.operation == 'CheckOut' || data.action.operation == 'SubTotal')) {
                User.findOne({id: JSON.stringify(senderId)}).exec(function (error, result) {
                  if (error) {
                    console.log(error)
                  } else {
                    let total = result.cart.reduce((a, b) => a + b, 0);
                    console.log('total is ' + JSON.stringify(total));
                    reply({message: {'text': 'Your total is $' + JSON.stringify(total)}});

                    if (data.action.operation == 'CheckOut') {
                      //Clear cart only at checkout
                      customer.cart = []
                      customer.save()
                    }
                  }
                })
              } else if (data.action && data.action.operation == 'RecordParking') {

                User.findOne({id: JSON.stringify(senderId)}).exec(function (error, result) {
                  if (error) {
                    console.log(error)
                  } else if (!result.parking) {
                    reply({message: {'text': 'Quel est votre numéro de stationnement?'}})
                    this.recordParking[senderId] = 'Yes'
                  } else {
                    let rmsg = {
                      attachment: {
                        type: "template",
                        payload: {
                          template_type: "button",
                          text: "Veuillez confirmer que votre numéro de stationnement est " + JSON.stringify(result.parking),
                          buttons: [
                            {
                              type: "postback",
                              title: "Confirmer",
                              payload: "CARWASH_PROCEED"
                            },
                            {
                              type: "postback",
                              title: "Changer",
                              payload: "CHANGE_PARKING"
                            }
                          ]
                        }
                      }
                    };
                    reply(rmsg)


                  }
                });
              } else if (data.action && data.action.operation == 'ChangeParking') {
                _this.recordParking[senderId] = 'Yes';

              } else if (data.action && data.action.operation == 'CarWashConfirm') {
                User.findOne({id: JSON.stringify(senderId)}).exec(function (error, result) {
                  if (error) {
                    console.log(error)
                  } else {
                    reply({
                      message: {
                        attachment: {
                          type: "template",
                          payload: {
                            template_type: "button",
                            text: `À votre service, donc ${result.service.day}, ${result.detail}.`,
                            buttons: [
                              {
                                type: "postback",
                                title: "Confirmer",
                                payload: "LAVE_AUTO_FINISH"
                              }

                            ]
                          }
                        }
                      }
                    })
                  }
                })
              } else if (data.action && data.action.operation == 'RecordRoom') {
                if (!customer.room) {
                  _this.recordRoom[senderId] = 'Yes'
                } else {
                  reply({
                    message: {
                      attachment: {
                        type: "template",
                        payload: {
                          template_type: "button",
                          text: `Veuillez confirmer que votre numéro de porte est le ${customer.room}.`,
                          buttons: [
                            {
                              type: "postback",
                              title: "Confirmer",
                              payload: "ENTRETIEN_PROCEED"
                            },
                            {
                              type: "postback",
                              title: "Changer",
                              payload: "CHANGE_ROOM"
                            }
                          ]
                        }
                      }
                    }
                  })
                }


              } else if (data.action && data.action.operation == 'ChangeRoom') {
                _this.recordRoom[senderId] = 'Yes';
                console.log('record room is ' + _this.recordRoom[senderId])


              } else if (data.action && data.action.operation == 'AddRoomToCart') {

                Rooms.findOne({nb: customer.room})
                  .then(foundRoom => {
                    if (!foundRoom || !foundRoom.nb || !foundRoom.price) throw new Meteor.Error('NOT_FOUND', 'Room not found', `Room ${customer.room} not found in database`)

                    let msg =
                      {
                        attachment: {
                          type: "template",
                          payload: {
                            template_type: "button",
                            text: `Le prix pour l'entretien ménager de la porte ${JSON.stringify(foundRoom.nb)} est de ${JSON.stringify(foundRoom.price)}$. Voulez-vous passer une commande? Celle-ci serait validée par un humain.`,
                            buttons: [
                              {
                                type: "postback",
                                title: "Commander",
                                payload: "ENTRETIEN_FINISH"
                              },
                              {
                                type: "postback",
                                title: "Retour au menu",
                                payload: "SERVICES"
                              }
                            ]
                          }
                        }
                      }
                    reply({message: msg})
                    customer.set('cart', customer.cart.concat([foundRoom.price]))
                    customer.save()
                  })
                  .catch(err => {
                      console.log(err)
                      let msg = {
                        attachment: {
                          type: "template",
                          payload: {
                            template_type: "button",
                            text: `Oops, nous n'avons pas réussis à trouver la porte ${customer.room} dans notre base de données.`,
                            buttons: [
                              {
                                type: "postback",
                                title: "Ré-essayer",
                                payload: "CHANGE_ROOM"
                              },
                              {
                                content_type: "text",
                                title: "Parler à un humain",
                                payload: "HUMAN"
                              }
                            ]
                          }
                        }
                      };
                      reply({message: msg})
                    })
              }

              reply({message: data.response});
            }
          })
          .catch(err => {
            console.log(err)
            reply({
              message: {
                text: "Désolé je n'ai pas compris votre demande, voulez-vous parler à un humain?",
                quick_replies: [
                  {
                    content_type: text,
                    title: "Oui",
                    payload: "HUMAN"
                  },
                  {
                    content_type: text,
                    title: "Retour au Menu",
                    payload: "SERVICES"
                  }

                ]
              }
            });
          });
      }
    })


    return promise
  }

}

export default new DefaultModule()
