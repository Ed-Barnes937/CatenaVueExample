const Catena = {
  install (Vue, opts = {}) {
    if (this.installed) {
      return
    }

    this.installed = true
    const $catena = {}
    Vue.util.defineReactive($catena, 'catena', {})

    Vue.prototype.$catena = $catena.catena

    // if (opts.transitions) {
    //   Object.keys(opts.transitions).forEach(key => {
    //     const t = opts.transitions[key]
    //     if (t.name !== undefined && t.name.startsWith('catena-')) {
    //       Vue.component(t.name, t)
    //     }
    //   })
    // }

    // if (opts.directives) {
    //   Object.keys(opts.directives).forEach(key => {
    //     const d = opts.directives[key]
    //     Vue.directive(d.name, d)
    //   })
    // }

    if (opts.components) {
      Object.keys(opts.components).forEach(key => {
        const c = opts.components[key]
        Vue.use(c)
      })
    }
  }
}

export default Catena
