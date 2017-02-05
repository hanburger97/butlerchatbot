import {BaseHandler} from './handlers'
import Responses from '/imports/api/messenger/Responses'
import Postbacks from '/imports/api/messenger/Postbacks'
import Rooms from '/imports/api/rooms/Rooms'

class DefaultModule extends BaseHandler {
  constructor() {
    super()
    console.log('new default module')
    this.pausedUsers = []
    this.recordRoom = []
    this.recordParking = []
    this.recordEmail = []
    this.stopAutoReply = false //When True, bot will not answer when message is undefined
    //     ^ stopAutoReply should be set to true when user click on a button that need to be followed up by a typed response
    //        (e.g. Entering room number) only then will the stopAutoReply be set to false to prevent the "i dont unserstand"
    //        message to be triggered. Once the info being recorded, it should be set back to false
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
            _this.stopAutoReply = false;
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

        customer.set('parking', payload.message.text)
        customer.save()
        reply({
          message: {
            'text': 'Parfait! Vous pouvez continuer', quick_replies: [
              {
                content_type: "text",
                title: "Continuer",
                payload: "CARWASH_PROCEED"
              }
            ]
          }
        });
        _this.stopAutoReply = false;
        delete _this.recordParking[senderId];
      } else if (_this.recordEmail[senderId] && _this.recordEmail[senderId]== 'Yes'){
        customer.set('email', payload.message.text)
        customer.save()
        reply({
          message: {
            'text': 'Parfait! Votre recu serait envoye a votre courriel', quick_replies: [
              {
                content_type: "text",
                title:  "Retour aux produits",
                payload: '//SHOW_PRODUCTS/{\"vendor\":\"Alexis le gourmand\"}'
              }
            ]
          }
        });
        _this.stopAutoReply = false
      }
      /**Expired Timeout section**/
      else {
        delete _this.pausedUsers[senderId]
      }
      /*******************/


      if (payload.message && payload.message.quick_reply) {
        console.log('In quickreply elif');
        Postbacks.findOne({trigger: payload.message.quick_reply.payload})
          .then(postback => {

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
              else if (data.action && data.action.operation == 'AddCart') {
                //AddCart action has to be added to the confirmation msg of each item
                //Check if user already exists else upsert

                customer.cart = result.cart.concat([Number(data.action.value)])
                customer.save()

              } else if (data.action && (data.action.operation == 'CheckOut' || data.action.operation == 'SubTotal')) {
                let total = customer.cart.reduce((a, b) => a + b, 0);
                console.log('total is ' + JSON.stringify(total));
                reply({message: {'text': 'Your total is $' + JSON.stringify(total)}});

                if (data.action.operation == 'CheckOut') {
                  //Clear cart only at checkout
                  customer.cart = []
                  customer.save()
                }


              } else if (data.action && data.action.operation == 'RecordParking') {

                if (!customer.parking) {
                  reply({message: {'text': 'Quel est votre numéro de stationnement?'}})
                  this.recordParking[senderId] = 'Yes'
                } else {
                  let rmsg = {
                    attachment: {
                      type: "template",
                      payload: {
                        template_type: "button",
                        text: "Veuillez confirmer que votre numéro de stationnement est " + JSON.stringify(customer.parking),
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
                  reply({message:rmsg})
                }


              } else if (data.action && data.action.operation == 'ChangeParking') {
                _this.recordParking[senderId] = 'Yes'
                _this.stopAutoReply = true


              } else if (data.action && data.action.operation == 'CarWashConfirm') {
                reply({
                  message: {
                    attachment: {
                      type: "template",
                      payload: {
                        template_type: "button",
                        text: `À votre service, donc ${customer.service.day}, ${customer.detail}.`,
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


              } else if (data.action && data.action.operation == 'RecordRoom') {
                if (!customer.room) {
                  _this.recordRoom[senderId] = 'Yes'
                  _this.stopAutoReply = true
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
                _this.stopAutoReply = true
                console.log('record room is ' + _this.recordRoom[senderId])


              } else if (data.action && data.action.operation == 'RecordEmail'){
                _this.stopAutoReply = true
                _this.recordEmail[senderId] = 'Yes'
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
          });
      }
    })


    return promise
  }

}

export default new DefaultModule()
