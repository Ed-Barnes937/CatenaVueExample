import {saveSvgAsPng} from 'save-svg-as-png'
import Papa from 'papaparse'
import {saveAs} from 'file-saver'

/**
 * Mixins, available application-wide
 * **/
const commonMethods = {
  methods: {
    /**
     * Get the entire state from Vuex.Store
     * @method getGlobalData
     * @return {Object}
     * */
    getGlobalData () {
      return this.$store.getters.state
    },
    /**
     * Get the language strings from Vuex.Store
     * @method getLang
     * @return {Object}
     * */
    getLang () {
      return this.getGlobalData().lang
    },
    /**
     * Get the application title
     * @method getAppTitle
     * @return {String}
     * */
    getAppTitle () {
      return this.getLang().appTitle
    },
    /**
     * Get a language key as a specified parameter from Vuex.Store
     * @method getLangKey
     * @param {String} key
     * @return {String}
     * */
    getLangKey (key) {
      return this.getLang()[key]
    },
    /**
     * Commit data to Vuex.Store's data key
     * Shorthand for the this.$store.commit('setData', data) mutation
     * @method setData
     * @param {Object} data
     * {
     *  name: {String},
     *  data: {Object}
     * }
     * @return {void}
     * */
    setData (data) {
      this.$store.commit('setData', data)
    },
    /**
     * Commit data to Vuex.Store's data.tlds key
     * Shorthand for the this.$store.commit('setTldData', data) mutation
     * @method setData
     * @param {Object} data
     * {
     *  name: {String},
     *  data: {Object}
     * }
     * @return {void}
     * */
    setTldData (data) {
      this.$store.commit('setTldData', data)
    },
    /**
     * Get the configuration settings from Vuex.Store
     * @method getConfig
     * @method getConfig
     * @return {Object}
     * */
    getConfig () {
      return this.$store.getters.config
    },
    /**
     * Get the data root from from Vuex.Store
     * @method getDataRoot
     * @return {String}
     * */
    getDataRoot () {
      const portfolio = (this.getStoredPortfolio() || { value: 'portfolionotste' }).value
      return `${this.getConfig().dataRoot}${portfolio}/`
    },
    /**
     * Get the data root v2 from data/config.js
     * @return {String}
     */
    getDataArrayRoot () {
      const portfolio = (this.getStoredPortfolio() || { value: 'portfolionotste' }).value
      return this.getConfig().dataArrayRoot + portfolio + '/'
    },
    /**
     * Get the stored portfolio details and set manually the first item in the portfolios array
     * @method getStoredPortfolio
     * @return {Object|void}
     * */
    getStoredPortfolio () {
      const flamingo = JSON.parse(this.$localStorage.get('flamingo'))
      return flamingo ? flamingo.portfolio : null
    },
    /**
     * Get the stored portfolio details and set manually the first item in the portfolios array
     * @method getStoredPortfolio
     * @param {Object} portfolio
     * @param {Boolean} reload [optional]
     * @return void
     * */
    setPortfolio (portfolio, reload) {
      this.$router.push({
        path: '/'
      })
      this.$localStorage.set('flamingo', JSON.stringify({
        portfolio
      }))
      if (reload) {
        window.location.reload()
      }
    },
    /**
     * Sort arrays in array
     * @method sortArraysInArray
     * @param {Array} array
     * @param {Number} index
     * @param {String} direction [optional]
     * @return Array
     * */
    sortArraysInArray (array, index, direction) {
      direction = direction || 'asc'
      return array.sort(function (a, b) {
        if (direction === 'asc') {
          return a[index] > b[index] ? -1 : 1
        }
        return a[index] > b[index] ? 1 : -1
      })
    },
    /**
     * Set page subtitle
     * @method setPageSubTitle
     * @param {String} subtitle
     * @return void
     * */
    setPageSubTitle (subtitle) {
      this.$root.$emit('setPageSubTitle', subtitle)
    },
    /**
     * Remove http, https and www from a url string
     * @method removeProtocol
     * @param {String} url
     * @return {String}
     * */
    removeProtocol (url) {
      return url.replace(/^.*:\/\//i, '').replace(/www./, '').replace(/\/$/, '')
    },
    /**
     * Emit an ajax event on and off
     * @method ajax
     * @param {Boolean} state
     * @return void
     * */
    ajax (state) {
      this.$root.$emit('ajax', state)
    },
    /**
     * @method saveDiagram
     * @param {String} diagramId [optional] default: '.svg-viewer'
     * @param {String} fileName [optional] default: 'diagram.png'
     * @param {Object} scale [optional] default: 1
     * @return void
     * */
    saveDiagram (diagramId, fileName, scale) {
      const element = document.querySelector(diagramId) || document.querySelector('.svg-viewer')
      let bbox = this.$d3.select(element)._groups[0][0].getBBox()
      saveSvgAsPng(element, fileName || 'diagram.png', { backgroundColor: 'white', scale: scale || 1, height: bbox.height, width: bbox.width, top: bbox.y, left: bbox.x })
    },
    /**
     * @method contextMenu
     * @param {Object} node
     * @return void
     * */
    contextMenu (node) {
      const d3 = this.$d3
      const event = d3.event
      const menuElement = this.$refs['context-menu']
      menuElement.elementData = node
      menuElement.position(event.clientX, event.clientY).show()
      d3.event.preventDefault()
    },
    /**
     * Export linkmap data to CSV file
     * @return void
     * */
    exportToCsv () {
      const filename = 'linkmap.csv'
      const type = 'text/csv;charset=utf-8'
      const nestedNode = 'nested-node'
      const graphData = this.graphData
      const mainNodes = graphData.nodes.filter(item => item.data.type !== nestedNode)
      const headers = ['from', 'to', 'numberOfLinks', 'anchorText']
      const unparsedData = []
      mainNodes.forEach((mainNode) => {
        const from = Object.keys(mainNode.data.domainData)
        const to = mainNode.name
        from.forEach((domain) => {
          const domainData = mainNode.data.domainData[domain]
          const count = domainData.count
          unparsedData.push([domain, to, count])
        })
      })
      unparsedData.unshift(headers)
      const blob = new Blob([Papa.unparse(unparsedData)], {type: type})
      saveAs(blob, filename)
    },
    /**
     * Create API call URL out of the specified apiEndpoint in (src/data/config.js), currently selected portfolio and resource
     * @method createApiResource
     * @param {String} resource
     * @return {String|void} [optional]
     * */
    createApiResource (resource) {
      const portfolios = `${this.$store.getters.apiEndpoint}portfolios/`
      if (!resource) {
        return portfolios
      }
      return `${portfolios}${this.getStoredPortfolio().value}/${resource}`
    },
    /**
     * Prepend protocol to a domain
     * @method prependProtocolToDomain
     * @return {String}
     * **/
    prependProtocolToDomain (domain) {
      return `http://${domain}`
    },
    /**
     * Colored console logs
     * @method log
     * @param {String} message [optional]
     * @param {Any} data [optional]
     * @param {String} color [optional]
     * @return {String}
     * **/
    log (message, data, color) {
      console.log(`%c${message || null}`, `background: ${color || '#43a047'}; color: #fff; border-radius: 3px; display: inline-block; padding: 4px;`, data)
    }
  }
}

export default commonMethods
