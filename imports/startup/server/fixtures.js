import {Migrations} from 'meteor/percolate:migrations'

/**
 * Fill the DB with example data on startup
 */


Migrations.add({
  version: 2,
  up: function () {

    const responses = JSON.parse(Assets.getText('fixtures/responses_cleaned.json'))

    const responsesCollection = new Meteor.Collection('responses', {_suppressSameNameError: true})
    responsesCollection.remove({})
    responses.forEach((response) => {
      responsesCollection.insert(response)
    })

    const rooms = JSON.parse(Assets.getText('fixtures/rooms_cleaned.json'))

    const roomsCollection = new Meteor.Collection('rooms', {_suppressSameNameError: true})
    roomsCollection.remove({})
    rooms.forEach((room) => {
      roomsCollection.insert(room)
    })

  }
});


Migrations.add({
  version: 3,
  up: function () {
    const postbacks = JSON.parse(Assets.getText('fixtures/postbacks_cleaned.json'))
    const responses = JSON.parse(Assets.getText('fixtures/responses_cleaned.json'))
    const rooms = JSON.parse(Assets.getText('fixtures/rooms_cleaned.json'))

    const roomsCollection = new Meteor.Collection('rooms', {_suppressSameNameError: true})
    roomsCollection.remove({})
    rooms.forEach((room) => {
      roomsCollection.insert(room)
    })

    const responsesCollection = new Meteor.Collection('responses', {_suppressSameNameError: true})
    responsesCollection.remove({})
    responses.forEach((response) => {
      responsesCollection.insert(response)
    })

    const postbacksCollection = new Meteor.Collection('postbacks', {_suppressSameNameError: true})
    postbacksCollection.remove({})
    postbacks.forEach((postback) => {
      postbacksCollection.insert(postback)
    })

  }
});

Migrations.add({
  version: 4,
  up: function () {
    if (!Meteor.users.findOne({emails: {$elemMatch: {address: 'admin@elicng.com'}}})) {
      Accounts.createUser({
        username: 'admin@elicng.com',
        password: 'admin@elicng.com',
        email: 'admin@elicng.com'
      });
    }
  }
});

Migrations.add({
  version: 5,
  up: function () {
    const adminUser = Meteor.users.findOne({emails: {$elemMatch: {address: 'admin@elicng.com'}}})
    Roles.setUserRoles(adminUser._id, 'admin')
  }
});

Meteor.startup(() => {
  Migrations.migrateTo('latest');
});
