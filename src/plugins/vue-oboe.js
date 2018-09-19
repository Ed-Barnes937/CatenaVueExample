import oboe from 'oboe'

const VueOboe = {
  install: install
}

function install (Vue, options) {
  if (install.installed) return
  install.installed = true

  Object.defineProperty(Vue.prototype, '$oboe', {
    get () {
      return oboe
    }
  })
}

export default VueOboe
