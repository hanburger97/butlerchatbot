import {Migrations} from 'meteor/percolate:migrations'

Migrations.add({
  version: 1,
  up: function () {//code to migrate up to version 1
  }
})

Meteor.startup(() => {
  Migrations.migrateTo('latest');
})
