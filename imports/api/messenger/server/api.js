import Bot from './Bot'

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
