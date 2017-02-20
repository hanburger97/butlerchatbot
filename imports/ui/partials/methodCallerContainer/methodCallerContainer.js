import './methodCallerContainer.html';

Template.methodCallerContainer.onCreated(function () {
  this.data.response = new ReactiveVar(null);
  if (!this.data.methodName) {
    throw new Meteor.Error(500, 'MethodCallerContainer: No method name passed');
  }

  Meteor.call(this.data.methodName, this.data.methodParams, function (err, response) {
    if (err) console.log(err);
    this.data.response.set(response);
  }.bind(this));

});

Template.methodCallerContainer.helpers({
  isReady () {
    return this.response.get() !== null;
  },
  data () {
    return this.response.get();
  }
});

Template.methodCallerContainer.events({});
