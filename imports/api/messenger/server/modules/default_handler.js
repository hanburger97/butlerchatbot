import {BaseHandler} from './base_handler'
import Responses from '/imports/api/messenger/Responses'
import Postbacks from '/imports/api/messenger/Postbacks'
import Rooms from '/imports/api/rooms/Rooms'
import { Email } from 'meteor/email'

class DefaultModule extends BaseHandler {
  constructor() {
    super()
    console.log('new default module')
    this.pausedUsers = []
    this.recordRoom = []
    this.recordParking = []
    this.recordEmail = []
    this.userInput = []
    this.entretienInput = []
    this.handymanInput = []
    this.stopAutoReply = false //When True, bot will not answer when message is undefined
    //     ^ stopAutoReply should be set to true when user click on a button that need to be followed up by a typed response
    //        (e.g. Entering room number) only then will the stopAutoReply be set to false to prevent the "i dont unserstand"
    //        message to be triggered. Once the info being recorded, it should be set back to false
  }

  handle({payload, reply, senderId, customer, queryUrl}) {
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
           _this.recordRoom[senderId] = 'No'
         })
         .catch(err => {
           console.log(err)
         })


      } else if (_this.recordParking[senderId] && _this.recordParking[senderId] == 'Yes') {

        customer.set('parking', payload.message.text)
        customer.save()
        reply({
          message: {
            'text': `Parfait, le numéro de stationnement ${customer.parking} est enregistré dans votre dossier `,
            quick_replies: [
              {
                content_type: "text",
                title: "Continuer",
                payload: "CARWASH_PROCEED"
              }
            ]
          }
        });
        //_this.stopAutoReply = false;
        _this.recordParking[senderId] = 'No'


        delete _this.recordParking[senderId];
      } else if (_this.recordEmail[senderId] && _this.recordEmail[senderId] == 'Yes') {
        customer.set('email', payload.message.text)
        customer.save()
        reply({
          message: {
            'text': 'Parfait! Votre recu sera envoyé à votre courriel', quick_replies: [
              {
                content_type: "text",
                title: "Retour aux produits",
                payload: '//SHOW_PRODUCTS/{\"vendor\":\"Alexis le gourmand\"}'
              }
            ]
          }
        });
        _this.stopAutoReply = false
        _this.recordEmail[senderId] = 'No'
      }
      /**Expired Timeout section**/
      else if (_this.userInput[senderId] && _this.userInput[senderId]== 'Yes'){
        customer.set('User input', payload.message.text)
        customer.save()
         .then(() => {
           delete _this.userInput[senderId]
           //_this.stopAutoReply = false
           return reply({
             message:{
               text:`À votre service ${customer.metadata.first_name}. Veuillez m'accorder quelques minutes pour traiter votre demande et vous revenir avec une proposition de thérapeuthe et de date. `,
               quick_replies:[
                 {
                   content_type: 'text',
                   title:'Retour au menu',
                   payload:'SERVICES'
                 }
               ]
             }
           })
         })

      } else if (_this.handymanInput[senderId]){
        console.log(_this.handymanInput[senderId])
        if (_this.handymanInput[senderId] == '2'){
          customer.set('Travail manuel temps', payload.message.text)
          customer.save()
          delete _this.handymanInput[senderId]
          return reply({
            message:{
              text:`Merci ${customer.metadata.first_name}. Nous prendrons quelques minutes ( entre 8h00 et 18h00 ) pour traiter votre demande et vous revenir avec une proposition.  Tous nos professionnels sont triés sur le volet et coûtent habituellement 27$ de l'heure`,
              quick_replies:[
                {
                  content_type:'text',
                  title:'Retour au menu',
                  payload:'SERVICES'
                }
              ]
            }
          })


        }else if (_this.handymanInput[senderId] == '1'){
          customer.set('Travaux manuel description', payload.message.text)
          customer.save()
          _this.handymanInput[senderId] = '2'
          _this.stopAutoReply = true
          return reply({
            message:{
              text:`Quand aimeriez-vous que ce soit fait, vous pouvez être général ou précis?`
            }
          })


        }

      }else if (_this.entretienInput[senderId] && _this.entretienInput[senderId]== 'Yes'){
        customer.set(`heure d'entretien`, payload.message.text)
        customer.save()
         .then( () => {
           delete _this.entretienInput[senderId]
           //_this.stopAutoReply = false
           reply({
             message: {
               text: `À votre service ${customer.metadata.first_name}, veuillez simplement m'envoyer un message si vous sortez durant les heures mentionnées, je viendrai chercher votre clef en moins de 5 minutes, je serai déjà dans l'immeuble.`,
               quick_replies: [
                 {
                   content_type: 'text',
                   title: 'Retour au menu',
                   payload: 'SERVICES'
                 }
               ]
             }
           })
         })
      }
      else {
        delete _this.pausedUsers[senderId]
      }
      /*******************/


      if (payload.message && payload.message.quick_reply) {
        console.log('In quickreply');
        Postbacks.findOne({trigger: payload.message.quick_reply.payload})
          .then(postback => {

            if (postback.action && postback.action.operation == 'RecordDay') {
              customer.set('service', {
                day: postback.action.value
              })
              customer.save()
              reply({message: postback.response})


            } else if (postback.action && postback.action.operation == 'RecordUserInput'){

              if (postback.action.value && postback.action.value == 'ENTRETIEN'){
                _this.entretienInput[senderId]='Yes'
                _this.stopAutoReply = true
                reply({message: postback.response})
              } else {
                _this.stopAutoReply = true
                _this.userInput[senderId]= 'Yes'
                reply({message: postback.response})
              }
            } else if (postback.action && postback.action.operation == 'AddDetail') {
              customer.set('detail', postback.action.value)
              customer.save()
              reply({message: postback.response})


            } else if (postback.action && postback.action.operation == 'RecordParking') {

              if (!customer.parking) {
                reply({message: {'text': 'Quel est votre numéro de stationnement?'}})
                _this.recordParking[senderId] = 'Yes'
                _this.stopAutoReply = true
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
                reply({message: rmsg})
              }


            } else if (postback.action && postback.action.operation == 'CarWashConfirm') {
              reply({
                message: {
                  text: `À votre service ${customer.metadata.first_name}, donc ${customer.service.day}, ${customer.detail}.`,
                  quick_replies:[
                    {
                      content_type:'text',
                      title:'Retour au menu',
                      payload: 'SERVICES'
                    },
                    {
                      content_type:'text',
                      title:'Annuler Lave-Auto',
                      payload: 'CARWASH_CANCEL'
                    }
                  ]
                }
              })


            } else if (postback.action && postback.action.operation == 'ConfirmService') {
              reply({message: {'text': 'Parfait'}})

            } else {
              reply({message: postback.response})

            }
          })
          .catch(err => {
            if (payload.message.quick_reply.payload == 'HUMAN'){
              /*Email.send({
                from: 'admin@majordome.io',
                to:'han@hanxbox.com',
                subject: `Customer ${customer.metadata.first_name},${customer.metadata.last_name} asked to speak to a human`,
                text:'To set the bot to manual mode please change it in the database for now, we are working on a solution asap'
              })*/
              customer.set('Request Human',true)
              customer.save()
               .then( () => {
                 return reply({
                   message:{
                     text:`À votre service ${customer.metadata.first_name}, un collègue humain prendra la relève dans quelques minutes, entre 9h00 et 23h00.`,
                     quick_replies:[
                       {
                         content_type:'text',
                         title:'Retour au menu',
                         payload: 'SERVICES'
                       }
                     ]
                   }
                 })
               })


            } else {
              return reply({
                message: {
                  text: `Désolé ${customer.metadata.first_name}, j'ai mal compris votre demande, j'apprends mon métier!  Est-ce que mon collègue humain peut prendre le relais pour vous aider`,
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
              })
            }

          })
      } else if (payload.message && payload.message.text) {
        payload.message.text = payload.message.text.toLowerCase();
        const words = payload.message.text.split(' ');
        //let words2 = payload.message.text.split(' ');
        //console.log(words);
        let r = 0;
        for (let z = 0; z < words.length; z++) {
          let word = words[z];

          return Responses.findOne({trigger: word})
            .then((response) => {
              _this.stopAutoReply = false;
              if (response && response.action && response.action.operation == 'Timeout') {
                let until = new Date(new Date().getTime() + (Number(response.action.value) * 1000));
                _this.pausedUsers[senderId] = until;
                return reply({message: response.response});
              } else if (response) {
                return reply({message: response.response});

              }
            })
            .catch(err => {
              console.log(err.message)
              if (!_this.stopAutoReply) {
                r += 1
                console.log(`Words is ${words}`);
                if (r == words.length) {
                  console.log("None of the words are defined");
                  return reply({
                    message: {
                      text: `Désolé ${customer.metadata.first_name}, j'ai mal compris votre demande, j'apprends mon métier!  Est-ce que mon collègue humain peut prendre le relais pour vous aider`,
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


              } else if (data.action && data.action.operation == 'RecordUserInput' && data.action.value =='HandymanForm'){
                _this.handymanInput[senderId] = '1'
                _this.stopAutoReply = true
                //reply({message: data.response})
              } else if (data.action && data.action.operation == 'ChangeParking') {
                _this.recordParking[senderId] = 'Yes'
                _this.stopAutoReply = true
                reply({message:data.response})


              }  else if (data.action && data.action.operation == 'CarWashConfirm') {
                reply({
                  message: {
                    text: `À votre service, donc ${customer.service.day}, ${customer.detail}.`,
                    quick_replies:[
                      {
                        content_type:'text',
                        title:'Retour au menu',
                        payload: 'SERVICES'
                      },
                      {
                        content_type:'text',
                        title:'Annuler Lave-Auto',
                        payload: 'CARWASH_CANCEL'
                      }
                    ]
                  }
                })


              } else if (data.action && data.action.operation == 'RecordRoom') {

                  return reply({
                    message: {
                      attachment: {
                        type: "template",
                        payload: {
                          template_type: "button",
                          text: `Je suis sur place du Lundi au Mercredi, de 7h00 à 18h00, pour faire le ménage des appartements, en n'utilisant que des produits nettoyants locaux et éco-responsables. Pour connaître votre prix, veuillez confirmer que votre numéro de porte est bien le ${customer.room}.`,
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



              } else if (data.action && data.action.operation == 'ChangeRoom') {
                _this.recordRoom[senderId] = 'Yes';
                _this.stopAutoReply = true
                console.log('record room is ' + _this.recordRoom[senderId])


              } else if (data.action && data.action.operation == 'RecordEmail') {
                _this.stopAutoReply = true
                _this.recordEmail[senderId] = 'Yes'
              } else if (data.action && data.action.operation == 'AddRoomToCart') {

                Rooms.findOne({nb: customer.room})
                  .then(foundRoom => {
                    if (!foundRoom || !foundRoom.nb || !foundRoom.price) throw new Meteor.Error('NOT_FOUND', 'Room not found', `Room ${customer.room} not found in database`)

                    let msg =
                      {
                        text: `${customer.metadata.first_name}, Le prix d'un ménage régulier dans votre appartement: ${JSON.stringify(foundRoom.nb)} est de ${JSON.stringify(foundRoom.price)}$. Aimeriez-vous en prévoir un?`,
                        quick_replies:[
                          {
                            content_type: 'text',
                            title: 'Oui',
                            payload: 'ENTRETIEN_FINISH'
                          },
                          {
                            content_type: 'text',
                            title: 'Non',
                            payload: 'ENTRETIEN_CANCEL'
                          }
                        ],

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

            if (!_this.stopAutoReply){
              return reply({
                message: {
                  text: `Désolé ${customer.metadata.first_name}, j'ai mal compris votre demande, j'apprends mon métier!  Est-ce que mon collègue humain peut prendre le relais pour vous aider`,
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
            } else{
              _this.stopAutoReply = false
            }


          });
      }
    })


    return promise
  }

}

export default new DefaultModule()
