import auth0 from 'auth0-js'
import { AUTH_CONFIG } from './auth0-variables'
import { AUTH_EVENTS } from './auth-events'
import EventEmitter from 'eventemitter3'

function Auth0Service () {
  EventEmitter.call(this)

  let webAuth = new auth0.WebAuth({
    domain: AUTH_CONFIG.domain,
    clientID: AUTH_CONFIG.clientID,
    redirectUri: AUTH_CONFIG.callbackUrl,
    audience: AUTH_CONFIG.apiUrl,
    responseType: AUTH_CONFIG.responseType,
    scope: AUTH_CONFIG.scope
  })

  this.auth0 = webAuth
  this.userProfile = null
}

Auth0Service.prototype = Object.create(EventEmitter.prototype)
Auth0Service.prototype.constructor = Auth0Service

Object.defineProperty(Auth0Service.prototype, 'token', {
  configurable: false,
  get: function () {
    return window.localStorage.getItem('id_token')
  },
  set: function (token) {
    window.localStorage.setItem('id_token', token)
  }
})

Object.defineProperty(Auth0Service.prototype, 'accessToken', {
  configurable: false,
  get: function () {
    return window.localStorage.getItem('access_token')
  },
  set: function (accessToken) {
    window.localStorage.setItem('access_token', accessToken)
  }
})

Object.defineProperty(Auth0Service.prototype, 'expiresAt', {
  configurable: false,
  get: function () {
    return window.localStorage.getItem('expires_at')
  },
  set: function (expiresIn) {
    let expiresAt = JSON.stringify(expiresIn * 1000 + new Date().getTime())
    window.localStorage.setItem('expires_at', expiresAt)
  }
})

Auth0Service.prototype.login = function login () {
  this.auth0.authorize()
}

Auth0Service.prototype.logout = function logout () {
  window.localStorage.removeItem('access_token')
  window.localStorage.removeItem('id_token')
  window.localStorage.removeItem('expires_at')
  window.localStorage.removeItem('user')
  this.userProfile = null
  this.auth0.authorize()
}

Auth0Service.prototype.isAuthenticated = function isAuthenticated () {
  return new Date().getTime() < this.expiresAt
}

Auth0Service.prototype.handleAuthentication = function handleAuthentication () {
  const self = this
  self.auth0.parseHash((err, authResult) => {
    if (authResult && authResult.accessToken && authResult.idToken) {
      self.expiresAt = authResult.expiresIn
      self.accessToken = authResult.accessToken
      self.token = authResult.idToken
      window.localStorage.setItem('user', JSON.stringify(authResult.idTokenPayload))
      self.emit(AUTH_EVENTS.isLoggedIn)
    } else if (err) {
      self.logout()
    }
  })
}

Auth0Service.prototype.getProfile = function getProfile (callback) {
  const self = this
  // NOTE Does not work as expected. Requires more investigation
  if (self.userProfile) {
    callback(null, self.userProfile)
  } else {
    self.auth0.client.userInfo(self.accessToken, function (err, profile) {
      if (err) {
        return callback(err)
      }

      self.userProfile = profile
      callback(null, self.userProfile)
    })
  }
  self.userProfile = JSON.parse(window.localStorage.getItem('user'))
  callback(null, self.userProfile)
}

export default Auth0Service
