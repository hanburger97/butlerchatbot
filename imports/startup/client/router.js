FlowRouter.route('/charge/:orderId', {
  action: function(params, queryParams) {
    BlazeLayout.render("mainLayout", {content: "charge"});
  }
});
