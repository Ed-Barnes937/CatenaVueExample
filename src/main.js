import Vue from 'vue'
import App from './App'
import router from './router'
import Vuetify from 'vuetify'
import VueRouter from 'vue-router'
import VueD3 from 'vue-d3'
import axios from 'axios'
import VueAxios from 'vue-axios'
import Vuex from 'vuex'
import mixins from './helpers/methods'
import S from 'string'
import globalData from './helpers/globalData' // @todo remove $globalData
import VueLocalStorage from 'vue-localstorage'
import FlamingoStore from './helpers/store'
import Catena from './components/catena'
import '../node_modules/vuetify/dist/vuetify.min.css'
import './App.css'
import './Catena.css'
import './Print.css'
import '../node_modules/ag-grid/dist/styles/ag-grid.css'
import '../node_modules/ag-grid/dist/styles/ag-theme-material.css'
import '../node_modules/ag-grid-enterprise/main'
import VueOboe from '@/plugins/vue-oboe'
import Auth0Service from './auth/auth0-service'
import { AUTH_EVENTS } from './auth/auth-events'
import VueAuth0Service from '@/plugins/vue-auth0-service'

// @todo remove $globalData
globalData.install = function () {
  Object.defineProperty(Vue.prototype, '$globalData', {
    get () {
      return globalData
    }
  })
}

let auth0Service = null
if (globalData.config.useAuthentication) {
  auth0Service = new Auth0Service()
  Vue.use(VueAuth0Service, auth0Service)

  // Setup Axios Interceptors on request to add OAuth token
  axios.interceptors.request.use(function (config) {
    if (auth0Service.token) {
      config.headers['Authorization'] = `Bearer ${auth0Service.token}`
    }
    return config
  }, function (err) {
    console.log('axios.request.err: ', err)
    return Promise.reject(err)
  })
  // Setup Axios Interceptors on response to provide common handling such as 401
  axios.interceptors.response.use(function (response) {
    return response
  }, function (err) {
    console.log('HTTP Error', err.message || err)
    console.log('axios.response.err: ', err)
    return Promise.reject(err)
  })
}

Vue.use(Vuex)
Vue.use(VueLocalStorage)
Vue.use(Vuetify)
Vue.use(VueRouter)
Vue.use(VueD3)
Vue.use(globalData) // @todo remove $globalData
Vue.use(VueAxios, axios)
Vue.use(Catena)
Vue.use(VueOboe)

Vue.config.productionTip = false // process.env.NODE_ENV === 'production'
const store = new Vuex.Store({
  state: FlamingoStore,
  mutations: {
    // set bootstrap data in the data.tlds object
    setData (state, data) {
      state.data[data.name] = data.data
    },
    setTldData (state, data) {
      state.data.tlds[data.name] = data.data
    },
    setPortfolios (state, data) {
      console.log('store mutation setPortfolios', data)
      state.config.portfolios = data
    },
    /**
     * Commit a user role to Vuex
     * @param {Object} state
     * @param {Object} newRole
     * {
     *  type: String,
     *  label: String
     * }
     * **/
    setRole (state, newRole) {
      state.selectedRole = state.userRoles.filter(role => role.type === newRole.type)[0]
    },
    /**
     * Store row data in Vuex
     * @param {Object} state
     * @param {Object} data
     * **/
    rowData (state, data) {
      state.rowData[data.type] = data.rows
    },
    setLinkmapNodes (state, linkmapNodes) {
      state.linkmapNodes = linkmapNodes
    },
    /**
     * Set the user profile from the Auth0 data
     * @param {Object} state
     * @param {Object} profile
     * **/
    profile (state, profile) {
      state.profile = profile
    }
  },
  getters: {
    profile: state => {
      return state.profile
    },
    userRoles: state => {
      return state.userRoles
    },
    selectedRole: state => {
      return state.selectedRole
    },
    dataFiles: state => {
      return state.dataFiles
    },
    data: state => {
      return state.data
    },
    tld: (state) => (tld) => {
      return state.data.tlds[tld]
    },
    tlds: state => {
      return state.data.tlds
    },
    domains: state => {
      return state.data.domains
    },
    jsonFiles: state => {
      return state.jsonFiles
    },
    config: state => {
      return state.config
    },
    events: state => {
      return state.events
    },
    lang: state => {
      return state.lang
    },
    state: state => {
      return state
    },
    event: (state) => (event) => {
      return state.events[event]
    },
    portfolios: state => {
      return state.config.portfolios
    },
    apiEndpoint: state => {
      return state.config.apiEndpoint
    },
    /**
     * Extract the linkmap nodes per portfolio that will be joined to the links array coming from the API
     * @setter extractLinkmapNodes
     * @param {Object} state
     * @param {String} portfolio
     * @eturn {Array}
     * **/
    extractLinkmapNodes: (state) => (portfolio) => {
      const nodes = []
      const extract = (where, type) => state.rowData[where].filter(product => {
        if (product.portfolioName === portfolio) {
          const id = product.domainName
          const isGIndex = product.googleLinks && product.googleLinks.length
          nodes.push({id, name: id, type, isOnline: true, isGIndex: isGIndex})
        }
      })
      extract('portfolioassetproductrecords', 'ms')
      extract('portfolioassetnetworkrecords', 'ls')
      return nodes
    },
    /**
     * Get the linkmap nodes to use with the linkmap component
     * @setter linkmapNodes
     * @param {Object} state
     * @return {Array}
     * **/
    linkmapNodes: state => {
      return state.linkmapNodes
    }
  }
})

const app = new Vue({
  router,
  store,
  template: '<App/>',
  components: {
    App
  },
  mixins: [
    mixins
  ],
  data () {
    return {
      events: this.$store.getters.events,
      jsonUrls: null,
      csvUrls: null,
      apiEndpoint: this.$store.getters.apiEndpoint
    }
  },
  created () {
    if (globalData.config.useAuthentication) {
      this.start()
      auth0Service.on(AUTH_EVENTS.isLoggedIn, () => {
        router.push({
          path: globalData.config.afterLoginRoute
        })
        this.$root.$emit('ready')
      })
    } else {
      console.log('DEVELOPER SECURITY WARNING: requirement for authentication appears to be turned OFF! (check globalData.config.useAuthentication)')
    }
  },
  methods: {
    /**
     * Open a domain from the context menu on right click
     * @method openSite
     * @param {Object} nodeData
     * @return void
     * **/
    openSite (nodeData) {
      window.open(`http://${nodeData.id}`)
    },
    /**
     * Download the crawl data for the requested domain
     * @method downloadSiteCsv
     * @param {Object} nodeData
     * @return void
     * **/
    downloadSiteCsv (nodeData) {
      const tld = this.$route.params.tld
      const domain = nodeData.id.split('.')[0]
      const dataRoot = this.getDataRoot()
      const url = `${dataRoot}linkmap/${tld}/${domain}/${domain}.csv`
      window.open(url)
    },
    /**
     * Bootstrap all initial data, so it is available application-wide and then start the app
     *
     * FV experiment moving this logic to the App.vue mounted() as this bootstrap does not get
     * triggered in the scenario - log off -> logon again
     *
     * @method bootstrap
     * @return void
     * **/
    bootstrap () {
    },
    /** filter moneysites from the linksites */
    filterMSLS () {
      this.$store.state.data.linkSite.domains = this.$store.state.data.linkSite.domains.filter(ls => !this.$store.state.data.moneySite.domains.includes(ls))
      // @todo remove $globalData
      this.$globalData.data.linkSite.domains = this.$globalData.data.linkSite.domains.filter(ls => !this.$globalData.data.moneySite.domains.includes(ls))
    },
    /**
     * Get grid data from the API by specified resource, storeKey and execute a callback
     * @method getGridData
     * @param {String} resource [required] API resource ENDPOINT/api/portfolios/PORTFOLIO/{resource}
     * @param {String} storeKey [required] Vuex store key
     * @param {Function} callback [optional]
     * @return void
     * **/
    getGridData (resource, storeKey, callback) {
      this.$http(this.createApiResource(resource)).then(response => {
        const items = response.data || []
        const data = {
          headers: [],
          dataUri: this.csvUrls[storeKey], // @todo download link should also come from the API
          items: items,
          recordsLength: items.length
        }
        Object.keys(data.items[0]).forEach((item) => {
          data.headers.push({
            text: S(item).humanize().s,
            value: item,
            align: 'left'
          })
        })
        this.setData({name: storeKey, data: data})
        this.$globalData.data[storeKey] = data // @todo remove $globalData
        if (callback && typeof callback === 'function') {
          callback.call(this)
        }
      })
    },
    /**
     * Get the Name Servers data
     * @method getNameServersData
     * @return void
     * **/
    getNameServersData () {
      this.getGridData('dnsany/NS', 'nameServers', this.getIpAddressesData)
    },
    _addSiteType (data, columns, dataProp, selectedColumns) {
      data.items.forEach(item => {
        if (item[dataProp] !== undefined && item[dataProp]) {
          item.type = this.$globalData.data.moneySite.domains.includes(item[dataProp].toLowerCase()) ? 'MS'
            : (this.$globalData.data.linkSite.domains.includes(item[dataProp].toLowerCase()) ? 'LS' : 'Ext')
        } else {
          item.type = ''
        }
      })
      columns.push({text: 'Type', value: 'type', align: 'left', selected: selectedColumns ? data.selectedColumns.indexOf('type') > -1 : true})
    },
    /**
     * Get the IP addresses data
     * @method getIpAddresses
     * @return void
     * **/
    getIpAddressesData () {
      this.getGridData('dnsany/A', 'ipAddresses', this.getWhoisData)
    },
    /**
     * Get the Whois data from the API
     * @method getWhoisData
     * @return void
     * **/
    getWhoisData () {
      const whois = 'whois'
      this.$http(this.createApiResource(whois)).then(response => {
        const flatHeaders = []
        const data = {
          items: [],
          headers: [],
          recordsLength: response.data.length,
          dataUri: this.csvUrls.whois,
          selectedColumns: this.getConfig().selectedColumns
        }
        response.data.forEach(item => {
          let itemData = {}
          Object.entries(item).forEach((entry) => {
            const key = entry[0]
            const value = entry[1]
            Object.keys(value).forEach(v => {
              const header = `${key}_${v}`
              if (isNaN(v)) {
                itemData[header] = value[v]
                if (!flatHeaders.includes(header)) {
                  flatHeaders.push(header)
                  data.headers.push({
                    text: S(header).humanize().s,
                    value: header,
                    align: 'left',
                    selected: data.selectedColumns.indexOf(header) > -1
                  })
                }
              }
            })
          })
          data.items.push(itemData)
        })
        data.headers = data.headers.filter((item) => {
          return !item.value.includes('fax')
        })
        this.setData({name: whois, data: data})
        this.$globalData.data[whois] = data // @todo remove $globalData
        /**
         * Since we don't have user roles at the moment,
         * we set one manually before application start
         * **/
        this.$store.commit('setRole', this.$store.getters.userRoles[0])
        this.start()
      })
    },
    /**
     * Start the app once all data has been bootstrapped
     * @method start
     * @return void
     * **/
    start () {
      this.$mount('#app')
    }
  }
})

if (process.env.NODE_ENV === 'development') {
  window.app = app
}
