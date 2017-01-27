import Bot from './Bot'
/*
("/messenger", function(req, res, next) {

  listProduct()
    .then((products) => {
      res.writeHead(200);
      res.end("Hello world from: " + Meteor.release);
    })

});*/


WebApp.connectHandlers.use('/messenger', (req, res) => {
  if (req.method == 'GET') {
    return Bot._verify(req, res)
  } else if (req.method == 'POST') {
    var body = "";
    req.on('data', Meteor.bindEnvironment(function (data) {
      body += data;
    }));

    req.on('end', Meteor.bindEnvironment(function () {
      Bot._handleMessage(JSON.parse(body))
      res.end(JSON.stringify({status: 'ok'}))
    }));

  }

})
