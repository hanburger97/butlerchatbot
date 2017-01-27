import {list as listProduct} from './methods'

WebApp.connectHandlers.use("/products", function(req, res, next) {

  listProduct()
    .then((products) => {
      res.writeHead(200);
      res.end("Hello world from: " + Meteor.release);
    })

});
