/**
 * Fill the DB with example data on startup
 */

const fs = require('fs')
const looseJson = require('loose-json')

function clean(fileName, transform = Function.prototype) {
  const data = require(__dirname + `/${fileName}.json`)

  const newList = []
  data.forEach((d) => {
    delete d['_id']
    delete d['id']
    delete d['__v']
    try {
      transform(d)
      //postback.response = looseJson(postback.response)
    } catch (err) {
      console.log(err)
    }

    newList.push(d)
  })

  fs.writeFile(`${__dirname}/${fileName}_cleaned.json`, JSON.stringify(newList))
}

clean('rooms')
clean('postbacks', function (postback) {
  postback.response = looseJson(postback.response)
})

clean('responses', function (postback) {
  postback.response = looseJson(postback.response)
})


