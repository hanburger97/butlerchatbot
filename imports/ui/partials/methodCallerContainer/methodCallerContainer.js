import './methodCallerContainer.html';

Template.methodCallerContainer.onCreated(function () {
  const _this = this
  _this.data.response = new ReactiveVar(null);
  if (!_this.data.methodName) {
    throw new Meteor.Error(500, 'MethodCallerContainer: No method name passed');
  }

  Meteor.call(_this.data.methodName, _this.data.methodParams, function (err, response) {
    if (err) console.log(err);
    
    _this.data.response.set(response);
  }.bind(_this));

});

Template.methodCallerContainer.helpers({
  isReady () {
    return this.response && this.response.get() !== null;
  },
  data () {
    return this.response.get()
  }
});

Template.methodCallerContainer.events({});
