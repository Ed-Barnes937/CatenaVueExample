const VueAuth0Service = {
  install: install
}

function install (Vue, auth0Service) {
  if (install.installed) return
  install.installed = true

  Object.defineProperty(Vue.prototype, '$auth0', {
    get () {
      return auth0Service
    }
  })
}

export default VueAuth0Service
