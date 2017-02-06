/** https://github.com/remixz/messenger-bot */

'use strict'
const url = require('url')
const qs = require('querystring')
const EventEmitter = require('events').EventEmitter
const request = require('request')
const crypto = require('crypto')

const NOTIFICATION_TYPE = {
  REGULAR: 'REGULAR',
  SILENT_PUSH: 'SILENT_PUSH',
  NO_PUSH: 'NO_PUSH'
}

class Bot extends EventEmitter {
  constructor(opts) {
    super()

    opts = opts || {}
    if (!opts.token) {
      throw new Error('Missing page token. See FB documentation for details: https://developers.facebook.com/docs/messenger-platform/quickstart')
    }
    this.token = opts.token
    this.app_secret = opts.app_secret || false
    this.verify_token = opts.verify || false
    this.debug = false || process.env.DEBUG == 'true'
  }

  getProfile(id, cb) {
    const _this = this

    const promise = new Promise((resolve, reject) => {
      if (!cb) cb = Function.prototype

      request({
        method: 'GET',
        uri: `https://graph.facebook.com/v2.6/${id}`,
        qs: {
          fields: 'first_name,last_name,profile_pic,locale,timezone,gender',
          access_token: _this.token
        },
        json: true
      }, (err, res, body) => {
        if (err) {
          reject(err)
          return cb(err)
        }
        if (body.error) {
          reject(body.error)
          return cb(body.error)
        }

        resolve(body)
        return cb(null, body)
      })
    })
    return promise
  }

  sendMessage(recipient, {message, notification_type = NOTIFICATION_TYPE.REGULAR}, cb) {
    const _this = this

    const promise = new Promise((resolve, reject) => {
      if (!cb) cb = Function.prototype

      if (_this.debug) {
        logInfo('MessengerBot::sendMessage')
        logInfo(message)
      }
      request({
        method: 'POST',
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {
          access_token: _this.token
        },
        json: {
          recipient: {id: recipient},
          message: message,
          notification_type: notification_type
        }
      }, (err, res, body) => {
        if (err) {
          if (_this.debug) {
            logInfo('MessengerBot::sendMessage::ERROR')
            logInfo(err.message)
          }
          reject(err)
          return cb(err)

        }
        if (body.error) {
          if (_this.debug) {
            logInfo('MessengerBot::sendMessage::ERROR')
            logInfo(body.error.message)
          }
          reject(body.error)
          return cb(body.error)

        }

        resolve(body)
        cb(null, body)
      })
    })

    return promise

  }

  sendSenderAction(recipient, senderAction, cb) {
    const _this = this
    const promise = new Promise((resolve, reject) => {
      if (!cb) cb = Function.prototype

      request({
        method: 'POST',
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {
          access_token: _this.token
        },
        json: {
          recipient: {
            id: recipient
          },
          sender_action: senderAction
        }
      }, (err, res, body) => {
        if (err) {
          reject(err)
          return cb(err)
        }
        if (body.error) {
          reject(body.error)
          return cb(body.error)
        }
        resolve(body)
        cb(null, body)
      })
    })

  }

  setThreadSettings({setting_type, threadState, settings}, cb) {

    const _this = this

    const promise = new Promise((resolve, reject) => {
      if (!cb) cb = Function.prototype

      request({
        method: 'POST',
        uri: 'https://graph.facebook.com/v2.6/me/thread_settings',
        qs: {
          access_token: _this.token
        },
        json: {
          setting_type: setting_type,
          thread_state: threadState,
          [setting_type]: settings
        }
      }, (err, res, body) => {
        if (err) {
          reject(err)
          return cb(err)
        }
        if (body.error) {
          reject(body.error)
          return cb(body.error)
        }
        resolve(body)
        return cb(null, body)
      })
    })

    return promise

  }

  removeThreadSettings(threadState, cb) {
    const _this = this

    const promise = new Promise((resolve, reject) => {
      if (!cb) cb = Function.prototype

      request({
        method: 'DELETE',
        uri: 'https://graph.facebook.com/v2.6/me/thread_settings',
        qs: {
          access_token: _this.token
        },
        json: {
          setting_type: 'call_to_actions',
          thread_state: threadState
        }
      }, (err, res, body) => {
        if (err) {
          reject(err)
          logError(new Error(err))
          return cb(err)
        }
        if (body.error) {
          reject(body.error)
          return cb(body.error)
        }
        resolve(body)
        return cb(null, body)
      })
    })

    return promise

  }

  setGetStartedButton(payload, cb) {
    if (!cb) cb = Function.prototype

    return this.setThreadSettings({setting_type: 'call_to_actions', threadState: 'new_thread', settings: payload}, cb)
  }

  setPersistentMenu(payload, cb) {
    if (!cb) cb = Function.prototype

    return this.setThreadSettings({
      setting_type: 'call_to_actions',
      threadState: 'existing_thread',
      settings: payload
    }, cb)
  }

  setGreeting(text, cb) {
    if (!cb) cb = Function.prototype

    return this.setThreadSettings({
      setting_type: 'greeting',
      threadState: 'existing_thread',
      settings: {'text': text}
    }, cb)
  }

  removeGetStartedButton(cb) {
    if (!cb) cb = Function.prototype

    return this.removeThreadSettings('new_thread', cb)
  }

  removePersistentMenu(cb) {
    if (!cb) cb = Function.prototype

    return this.removeThreadSettings('existing_thread', cb)
  }

  _handleMessage(json) {
    let entries = json.entry

    entries.forEach((entry) => {
      let events = entry.messaging

      events.forEach((event) => {

        // handle inbound messages and echos
        if (event.message) {
          if (event.message.is_echo) {
            this._handleEvent('echo', event)
          } else {
            if (this.debug) {
              logInfo('MessengerBot::HandleMessage')
              logInfo(event)
            }
            this._handleEvent('message', event)
          }
        }

        // handle postbacks
        if (event.postback) {
          if (this.debug) {
            logInfo('MessengerBot::HandlePostback')
            logInfo(event)
          }
          this._handleEvent('postback', event)
        }

        // handle message delivered
        if (event.delivery) {
          this._handleEvent('delivery', event)
        }

        // handle message read
        if (event.read) {
          this._handleEvent('read', event)
        }

        // handle authentication
        if (event.optin) {
          this._handleEvent('authentication', event)
        }

        // handle account_linking
        if (event.account_linking && event.account_linking.status) {
          if (event.account_linking.status === 'linked') {
            this._handleEvent('accountLinked', event)
          } else if (event.account_linking.status === 'unlinked') {
            this._handleEvent('accountUnlinked', event)
          }
        }
      })
    })
  }

  _getActionsObject(event) {
    return {
      setTyping: (typingState, cb) => {
        let senderTypingAction = typingState ? 'typing_on' : 'typing_off'
        this.sendSenderAction(event.sender.id, senderTypingAction, cb)
      },
      markRead: this.sendSenderAction.bind(this, event.sender.id, 'mark_seen')
    }
  }

  _verify(req, res) {
    let query = qs.parse(url.parse(req.url).query)

    if (query['hub.verify_token'] === this.verify_token) {
      return res.end(query['hub.challenge'])
    }

    return res.end('Error, wrong validation token')
  }

  _handleEvent(type, event) {
    this.emit(type, {
      senderId: event.sender.id,
      payload: event,
      reply: this.sendMessage.bind(this, event.sender.id),
      replyAction: this._getActionsObject(event),
      emitPayload: this._emitPayload.bind(this, type, event)
    })
  }

  _emitPayload(type, event, payload) {
    event.postback = {}
    event.postback.payload = payload
    this._handleEvent(type, event)
  }
}

const logInfo = (message) => {
  console.log(message);
}

const logError = (error) => {
  console.error(error)
}

const logWarning = (message) => {
  console.warn(message)
}

module.exports = Bot
