import {Migrations} from 'meteor/percolate:migrations'

/**
 * Fill the DB with example data on startup
 */

Migrations.add({
  version: 1,
  up: function () {
    const postbacks = JSON.parse(Assets.getText('fixtures/postbacks_cleaned.json'))

    const postbacksCollection = new Meteor.Collection('postbacks', {_suppressSameNameError: true})
    postbacks.forEach((postback) => {
      postbacksCollection.insert(postback)
    })

    const responses = JSON.parse(Assets.getText('fixtures/responses_cleaned.json'))

    const responsesCollection = new Meteor.Collection('responses', {_suppressSameNameError: true})
    responses.forEach((response) => {
      responsesCollection.insert(response)
    })

    const rooms = JSON.parse(Assets.getText('fixtures/rooms_cleaned.json'))

    const roomsCollection = new Meteor.Collection('rooms', {_suppressSameNameError: true})
    rooms.forEach((room) => {
      roomsCollection.insert(room)
    })



  }
});

Meteor.startup(() => {
  Migrations.migrateTo('latest');
});
